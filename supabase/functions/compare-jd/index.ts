import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and hiring manager.
You must follow instructions strictly.
You must output valid JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: "Resume text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Call SBERT Service for Semantic Similarity
    console.log("Calling SBERT service...");
    let similarityScore = 0;
    let sbertError = null;

    // In a real production env, this URL should be an env var
    // For this local setup, assuming the python service runs on localhost:8000
    // Note: Deno deploy might need a deployed URL. For local dev, we use the local python service.
    // If running inside Docker/etc, hostname might differ.
    try {
      // Use host.docker.internal to allow access to the host machine from within the Docker container
      const sbertResponse = await fetch("http://host.docker.internal:8000/similarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription
        })
      });

      if (sbertResponse.ok) {
        const sbertData = await sbertResponse.json();
        similarityScore = sbertData.similarity_score;
        console.log("SBERT Similarity Score:", similarityScore);
      } else {
        const errText = await sbertResponse.text();
        console.error("SBERT Service error:", sbertResponse.status, errText);
        sbertError = `SBERT Error: ${sbertResponse.status}`;
      }
    } catch (err) {
      console.error("Failed to call SBERT service:", err);
      sbertError = "SBERT Service unreachable";
      // Fallback or just proceed with 0 similarity (or handle gracefully)
    }

    // Step 2: Call Ollama with the pre-calculated similarity score
    const maxChars = 5000;
    const truncatedResume = resumeText.length > maxChars ? resumeText.substring(0, maxChars) + "..." : resumeText;
    const truncatedJD = jobDescription.length > maxChars ? jobDescription.substring(0, maxChars) + "..." : jobDescription;

    const userPrompt = `
<<<RESUME>>>
${truncatedResume}
<<<END>>>

<<<JOB_DESCRIPTION>>>
${truncatedJD}
<<<END>>>

TASK:
Compare the resume against the job description.
**IMPORTANT**: The calculated Semantic Similarity Score (SBERT) for this pair is: **${similarityScore}**.
Use this score as the ground truth for "similarityScore".

RULES:
- Do not include markdown
- Do not include explanations
- Output valid JSON only
- Follow this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "jobMatchPercentage": <number 0-100>,
  "skillMatchPercentage": <number 0-100>,
  "similarityScore": <number 0-100 (MUST MATCH provided SBERT score: ${similarityScore})>,
  "overallVerdict": "<Strong Match|Good Match|Moderate Match|Weak Match|Poor Match>",
  "verdictExplanation": "<2-3 sentence summary>",
  "requiredSkillsFromJD": ["<skill1>", "<skill2>", ...],
  "matchedSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<skill1>", "<skill2>", ...],
  "partialSkills": ["<skill1>", "<skill2>", ...],
  "skillGapAnalysis": {
    "critical": [{"skill": "...", "importance": "critical", "recommendation": "..."}],
    "important": [{"skill": "...", "importance": "important", "recommendation": "..."}],
    "nice_to_have": [{"skill": "...", "importance": "nice_to_have", "recommendation": "..."}]
  },
  "experienceAnalysis": {
    "requiredYears": "<X years>",
    "candidateYears": "<estimated years>",
    "experienceMatch": "<Exceeds|Meets|Below|Significantly Below>",
    "relevantExperience": ["...", "..."]
  },
  "keywordAnalysis": {
    "matchedKeywords": ["...", "..."],
    "missingKeywords": ["...", "..."],
    "keywordDensityScore": <number 0-100>
  },
  "recommendations": ["...", "..."],
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}
Respond with JSON only.`;

    // Call Ollama
    const taskType = "structured_analysis"; // Routes to Phi3
    const rawResponse = await generateOllamaResponse(systemPrompt, userPrompt, taskType);

    // Parse JSON safely
    const analysis = await parseJsonWithRetry(rawResponse, async () => {
      // Retry callback if parsing fails
      console.log("Retrying JSON generation for compare-jd...");
      return await generateOllamaResponse(systemPrompt, userPrompt + "\n\nIMPORTANT: Your previous response was invalid JSON. Output ONLY valid JSON now.", taskType);
    });

    // Enforce the SBERT score if it exists
    if (similarityScore !== 0) {
      analysis.similarityScore = similarityScore;
    }

    return new Response(
      JSON.stringify({ success: true, analysis, sbertOf: sbertError ? "failed" : "success" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("JD comparison error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
