import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert resume writer. Your task is to create an improved, polished version of a resume by applying all the provided improvements to the original content.

Guidelines:
1. Apply all bullet point improvements exactly as provided
2. Use the suggested title as the professional headline
3. Maintain professional formatting and structure
4. Organize into clear sections: Header, Summary, Experience, Skills, Education
5. Keep the improved resume concise but impactful
6. Ensure all improvements are naturally integrated
7. Output should be ready to use as-is`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const improvementsList = improvements.map((i: any, idx: number) => 
      `${idx + 1}. Original: "${i.original}" → Improved: "${i.improved}"`
    ).join('\n');

    const userPrompt = `Here is the original resume:

${originalResume}

Here are the improvements to apply:
${improvementsList}

Suggested Professional Title: ${suggestedTitle || 'Professional'}
${targetRole ? `Target Role: ${targetRole}` : ''}

Create an improved resume with these changes applied. Output in this exact JSON format (respond ONLY with valid JSON, no markdown):
{
  "improvedResume": "<complete improved resume as plain text with line breaks>",
  "sections": {
    "header": "<name, title, contact info section>",
    "summary": "<professional summary/objective paragraph>",
    "experience": "<work experience section with improved bullets>",
    "skills": "<skills section>",
    "education": "<education section>"
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let result;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI resume response");
    }

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
