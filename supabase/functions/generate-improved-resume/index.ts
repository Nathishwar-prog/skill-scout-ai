import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert resume writer.
You must follow instructions strictly.
You must output valid JSON only.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originalResume, improvements, suggestedTitle, targetRole } = await req.json();

    if (!originalResume || !improvements) {
      return new Response(
        JSON.stringify({ error: "Original resume and improvements are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const improvementsList = improvements.map((i: any, idx: number) =>
      `${idx + 1}. Original: "${i.original}" → Improved: "${i.improved}"`
    ).join('\n');

    const maxChars = 5000;
    const truncatedResume = originalResume.length > maxChars ? originalResume.substring(0, maxChars) + "..." : originalResume;

    const userPrompt = `
<<<RESUME>>>
${truncatedResume}
<<<END>>>

<<<IMPROVEMENTS>>>
${improvementsList}
<<<END>>>

TASK:
Create an improved, polished resume.
Suggested Title: ${suggestedTitle || 'Professional'}
${targetRole ? `Target Role: ${targetRole}` : ''}

RULES:
- Do not include markdown
- Do not include explanations
- Output valid JSON only
- Follow this exact JSON structure:
{
  "improvedResume": "<complete text with line breaks>",
  "sections": {
    "header": "<text>",
    "summary": "<text>",
    "experience": "<text>",
    "skills": "<text>",
    "education": "<text>"
  }
}
`;

    // Call Ollama
    const taskType = "resume_rewrite"; // Routes to Mistral for creative rewriting
    const rawResponse = await generateOllamaResponse(systemPrompt, userPrompt, taskType);

    // Parse JSON safely
    const result = await parseJsonWithRetry(rawResponse, async () => {
      console.log("Retrying JSON generation for generate-improved-resume...");
      return await generateOllamaResponse(systemPrompt, userPrompt + "\n\nIMPORTANT: Your previous response was invalid JSON. Output ONLY valid JSON now.", taskType);
    });

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate improved resume error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
