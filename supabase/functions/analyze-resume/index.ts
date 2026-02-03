import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer, recruiter, and career coach.
You must follow instructions strictly.
You must output valid JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, targetRole } = await req.json();

    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: "Resume text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const maxChars = 5000;
    const truncatedResume = resumeText.length > maxChars ? resumeText.substring(0, maxChars) + "..." : resumeText;

    const userPrompt = `
<<<RESUME>>>
${truncatedResume}
<<<END>>>

TASK:
Analyze the resume${targetRole ? ` for the role of ${targetRole}` : ''}.
1. Evaluate ATS compatibility
2. Assess skill relevance
3. Identify strengths/weaknesses
4. Suggest improvements
5. Extract parsed info

RULES:
- Do not include markdown
- Do not include explanations
- Output valid JSON only
- Follow this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "skillMatchScore": <number 0-100>,
  "experienceLevel": "<Beginner|Intermediate|Advanced>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>", "<strength4>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>", "<weakness4>"],
  "missingSkills": ["<skill1>", "<skill2>", ...up to 10 skills],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "parsedInfo": {
    "name": "<extracted name or null>",
    "email": "<extracted email or null>",
    "skills": ["<skill1>", "<skill2>", ...],
    "education": ["<education1>", ...],
    "experience": ["<job1>", "<job2>", ...]
  }
}`;

    // Call Ollama
    const taskType = "structured_analysis"; // Routes to Phi3 for parsing/scoring
    const rawResponse = await generateOllamaResponse(systemPrompt, userPrompt, taskType);

    // Parse JSON safely
    const analysis = await parseJsonWithRetry(rawResponse, async () => {
      // Retry callback if parsing fails
      console.log("Retrying JSON generation for analyze-resume...");
      return await generateOllamaResponse(systemPrompt, userPrompt + "\n\nIMPORTANT: Your previous response was invalid JSON. Output ONLY valid JSON now.", taskType);
    });

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Resume analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
