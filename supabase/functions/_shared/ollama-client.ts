
export type TaskType =
    | "resume_rewrite"
    | "ats_optimization"
    | "skill_gap_explanation"
    | "career_feedback"
    | "career_advice"
    | "natural_language_feedback"
    | "bullet_point_improvement"
    | "skill_extraction"
    | "gap_analysis"
    | "structured_analysis"
    | "rule_heavy_reasoning"
    | "fact_extraction"
    | "structured_resume"
    | "complex_matching";

export interface OllamaResponse {
    response: string;
    model_used: string;
    task_type: string;
    inference_time_ms: number;
}

const MODELS = {
    PRIMARY: "mistral:latest",   // For creative/natural language tasks
    SECONDARY: "phi3:latest"     // For strict JSON/structured tasks
} as const;

const OLLAMA_API_URL = "http://host.docker.internal:11434/api/generate";

const getModelForTask = (task: TaskType): string => {
    switch (task) {
        // Mistral tasks (Reasoning, Complex Matching, Creative)
        case "resume_rewrite":
        case "ats_optimization":
        case "skill_gap_explanation":
        case "career_feedback":
        case "career_advice":
        case "natural_language_feedback":
        case "bullet_point_improvement":
        case "structured_analysis": // Kept for backward compatibility if needed, but VibeCodeAgent uses complex_matching
        case "complex_matching": // Stage 5: Skill & Experience Matching
            return MODELS.PRIMARY;

        // Phi3 tasks (Fact Extraction, Structured, Strict JSON)
        case "skill_extraction":
        case "gap_analysis":
        case "structured_resume": // New Stage 1: Full Resume Extraction
        case "rule_heavy_reasoning":
        case "fact_extraction": // Stage 3: Fact Extraction
            return MODELS.SECONDARY;

        default:
            console.warn(`Unknown task type: ${task}, defaulting to ${MODELS.PRIMARY}`);
            return MODELS.PRIMARY;
    }
};

export const generateOllamaResponse = async (systemPrompt: string, userPrompt: string, task: TaskType): Promise<OllamaResponse> => {
    const model = getModelForTask(task);
    const startTime = Date.now();

    // Add logic to truncate inputs if they are too long (simple safety guard)
    const MAX_INPUT_CHARS = 12000; // Allow some buffer for prompt template
    if (userPrompt.length > MAX_INPUT_CHARS) {
        console.warn(`User prompt too long (${userPrompt.length} chars), truncating to ${MAX_INPUT_CHARS}`);
        userPrompt = userPrompt.substring(0, MAX_INPUT_CHARS) + "... [TRUNCATED]";
    }

    const finalPrompt = `
[SYSTEM_INSTRUCTIONS]
${systemPrompt}

[USER_INPUT]
${userPrompt}

[RESPONSE_FORMAT]
Response must be valid JSON only. Do not wrap in markdown code blocks.
`;

    console.log(`\n--- [AI-ENGINE START] ---`);
    console.log(`Task Type: ${task}`);
    console.log(`Routing to Model: ${model}`);
    console.log(`Input Length: ${finalPrompt.length} chars`);
    console.log(`-------------------------\n`);

    // Helper for timeout fetch
    const fetchWithTimeout = async (url: string, body: any, timeoutMs: number = 600000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (err) {
            clearTimeout(id);
            throw err;
        }
    };

    try {
        const response = await fetchWithTimeout(OLLAMA_API_URL, {
            model: model,
            prompt: finalPrompt,
            stream: false,
            options: {
                temperature: model === MODELS.SECONDARY ? 0.1 : 0.7, // Lower temp for Phi3 (structured), higher for Mistral (creative)
                num_ctx: 4096
            }
        }, 600000);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Ollama Error (${response.status}):`, errorText);
            throw new Error(`Ollama API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const endTime = Date.now();

        return {
            response: data.response,
            model_used: model,
            task_type: task,
            inference_time_ms: endTime - startTime
        };

    } catch (error: any) {
        console.error("Failed to call Ollama:", error);

        if (error.name === 'AbortError') {
            console.error("Ollama request timed out after 600s");
            throw new Error("AI Service Timeout: The local model took too long to respond.");
        }

        // Fallback for Docker environments
        if (OLLAMA_API_URL.includes("localhost")) {
            console.log("Retrying with host.docker.internal...");
            try {
                const fallbackUrl = "http://host.docker.internal:11434/api/generate";
                const response = await fetchWithTimeout(fallbackUrl, {
                    model: model,
                    prompt: finalPrompt,
                    stream: false,
                    options: { temperature: 0.2, num_ctx: 4096 }
                }, 600000);

                if (!response.ok) throw new Error("Fallback failed");
                const data = await response.json();
                const endTime = Date.now();
                return {
                    response: data.response,
                    model_used: model,
                    task_type: task,
                    inference_time_ms: endTime - startTime
                };
            } catch (retryError) {
                console.error("Fallback failed:", retryError);
                throw error;
            }
        }
        throw error;
    }
};

export const parseJsonWithRetry = async (responseObj: OllamaResponse, retryCallback?: () => Promise<OllamaResponse>): Promise<any> => {
    const rawText = responseObj.response;

    // Helper to clean JSON string
    const cleanJson = (text: string) => {
        let clean = text.trim();
        // aggressively strip markdown code blocks
        clean = clean.replace(/```json/gi, "").replace(/```/g, "");
        return clean.trim();
    };

    try {
        const clean = cleanJson(rawText);
        const parsed = JSON.parse(clean);
        // Inject metadata into the result
        return {
            ...parsed,
            _meta: {
                model: responseObj.model_used,
                task_type: responseObj.task_type,
                inference_time_ms: responseObj.inference_time_ms,
                timestamp: new Date().toISOString()
            }
        };
    } catch (e) {
        console.warn("Standard JSON Parse failed, attempting Regex Fallback extraction...", e);

        // Try to locate the outermost JSON object or array
        const firstOpenBrace = rawText.indexOf('{');
        const firstOpenBracket = rawText.indexOf('[');

        let startIdx = -1;
        let endIdx = -1;

        // Determine if we are looking for an object or array
        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startIdx = firstOpenBrace;
            endIdx = rawText.lastIndexOf('}');
        } else if (firstOpenBracket !== -1) {
            startIdx = firstOpenBracket;
            endIdx = rawText.lastIndexOf(']');
        }

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            try {
                const potentialJson = rawText.substring(startIdx, endIdx + 1);
                // Basic cleanup of potential trailing commas before closing braces (common LLM error)
                // This regex replaces ", }" with "}" and ", ]" with "]"
                const fixedJson = potentialJson.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

                const parsed = JSON.parse(fixedJson);
                return {
                    ...parsed,
                    _meta: {
                        model: responseObj.model_used,
                        task_type: responseObj.task_type,
                        inference_time_ms: responseObj.inference_time_ms,
                        generated_via: "regex_fallback_v3"
                    }
                };
            } catch (e2) {
                console.warn("Regex fallback v3 failed:", e2);
                console.warn("Snippet causing failure:", rawText.substring(startIdx, Math.min(startIdx + 100, rawText.length)) + "...");
            }
        }

        if (retryCallback) {
            console.log("Parse failed, invoking retry callback (self-correction)...");
            const newResponseObj = await retryCallback();
            return parseJsonWithRetry(newResponseObj);
        }

        console.error("CRITICAL: Failed to parse JSON. Raw Output Start:", rawText.substring(0, 200));
        throw new Error(`Failed to parse AI response as JSON. AI said: ${rawText.substring(0, 100)}...`);
    }
};

