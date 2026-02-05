import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an elite Career Coach and Resume Optimization Expert.
Your specialty is transforming generic bullet points into high-impact, results-oriented achievements using the STAR method (Situation, Task, Action, Result).
You must output strict JSON only.`;

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

    const maxChars = 3000;
    const truncatedResume = resumeText.length > maxChars ? resumeText.substring(0, maxChars) + "..." : resumeText;

    const userPrompt = `
<<<RESUME_CONTENT>>>
${truncatedResume}
<<<END_RESUME>>>

Target Role: ${targetRole || "General"}

TASK:
Analyze the resume and generate powerful improvements.

INSTRUCTIONS:
1. Identify weak, passive, or generic bullet points.
2. Rewrite them using the **STAR Method** (Situation, Task, Action, Result).
3. **Quantify** results wherever possible (numbers, %, $, time saved).
4. Use strong action verbs (e.g., "Spearheaded", "Optimized", "Architected").

EXAMPLE:
- Original: "Worked on a python script for data."
- Improved: "Architected a Python data automation script processing 50k+ records daily, reducing manual entry time by 40%."

OUTPUT FORMAT (JSON ONLY):
{
  "improvements": [
    {
      "original": "<original weak bullet>",
      "improved": "<powerful STAR version>",
      "type": "bullet"
    }
  ],
  "suggestedTitle": "<Strong Professional Title based on skills>",
  "projectIdeas": [
    "<Unique, impressive project idea 1 that demonstrates missing skills>",
    "<Project idea 2>",
    "<Project idea 3>",
    "<Project idea 4>",
    "<Project idea 5>"
  ]
}
Include 4-5 high-quality bullet improvements.`;

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
