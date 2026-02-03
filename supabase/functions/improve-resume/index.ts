import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert career coach and resume writer.
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
Based on this resume${targetRole ? ` targeting ${targetRole} role` : ''}, generate improvements using the STAR method (Situation, Task, Action, Result) and project ideas.

RULES:
- Do not include markdown
- Do not include explanations
- Output valid JSON only
- Follow this exact JSON structure:
{
  "improvements": [
    {
      "original": "<original bullet point>",
      "improved": "<STAR method improved version>",
      "type": "bullet"
    }
  ],
  "suggestedTitle": "<professional title>",
  "projectIdeas": [
    "<project 1>",
    "<project 2>",
    "<project 3>",
    "<project 4>",
    "<project 5>"
  ]
}
Include 4-5 bullet improvements and 5 project ideas.`;

    // Call Ollama
    const taskType = "resume_rewrite"; // Routes to Mistral for creative rewriting
    const rawResponse = await generateOllamaResponse(systemPrompt, userPrompt, taskType);

    // Parse JSON safely
    const improvements = await parseJsonWithRetry(rawResponse, async () => {
      console.log("Retrying JSON generation for improve-resume...");
      return await generateOllamaResponse(systemPrompt, userPrompt + "\n\nIMPORTANT: Your previous response was invalid JSON. Output ONLY valid JSON now.", taskType);
    });

    return new Response(
      JSON.stringify({ success: true, ...improvements }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Resume improvements error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
