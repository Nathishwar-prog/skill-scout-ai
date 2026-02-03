
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
    | "rule_heavy_reasoning";

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

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

const getModelForTask = (task: TaskType): string => {
    switch (task) {
        // Mistral tasks (Creative, Rewriting, Natural Language)
        case "resume_rewrite":
        case "ats_optimization":
        case "skill_gap_explanation":
        case "career_feedback":
        case "career_advice":
        case "natural_language_feedback":
        case "bullet_point_improvement":
            return MODELS.PRIMARY;

        // Phi3 tasks (Structured, Extraction, Strict JSON)
        case "skill_extraction":
        case "gap_analysis":
        case "structured_analysis":
        case "rule_heavy_reasoning":
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

    console.log(`[AI-ROUTER] Task: ${task} -> Routing to Model: ${model}`);

    try {
        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                prompt: finalPrompt,
                stream: false,
                options: {
                    temperature: model === MODELS.SECONDARY ? 0.1 : 0.7, // Lower temp for Phi3 (structured), higher for Mistral (creative)
                    num_ctx: 4096
                }
            }),
        });

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

    } catch (error) {
        console.error("Failed to call Ollama:", error);
        // Fallback for Docker environments
        if (OLLAMA_API_URL.includes("localhost")) {
            console.log("Retrying with host.docker.internal...");
            try {
                const fallbackUrl = "http://host.docker.internal:11434/api/generate";
                const response = await fetch(fallbackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: model,
                        prompt: finalPrompt,
                        stream: false,
                        options: { temperature: 0.2, num_ctx: 4096 }
                    }),
                });
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
        clean = clean.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
        return clean;
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
        console.warn("JSON Parse failed, attempting retry/cleanup...", e);

        // Try regex extraction
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                const parsed = JSON.parse(match[0]);
                return {
                    ...parsed,
                    _meta: {
                        model: responseObj.model_used,
                        task_type: responseObj.task_type,
                        inference_time_ms: responseObj.inference_time_ms,
                        generated_via: "regex_fallback"
                    }
                };
            } catch (e2) { }
        }

        if (retryCallback) {
            console.log("Parse failed, invoking retry callback (self-correction)...");
            const newResponseObj = await retryCallback();
            // Recursive call but without retryCallback to prevent infinite loop
            return parseJsonWithRetry(newResponseObj);
        }

        throw new Error("Failed to parse AI response as JSON");
    }
};

