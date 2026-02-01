import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert career coach and resume writer. Your job is to improve resume bullet points using the STAR method (Situation, Task, Action, Result) and suggest powerful action verbs.

Always make improvements:
1. More specific and quantifiable
2. Action-oriented with strong verbs
3. Results-focused with measurable outcomes
4. Relevant to modern job markets`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Based on this resume${targetRole ? ` targeting ${targetRole} role` : ''}:

${resumeText}

Generate improvements in this exact JSON format (respond ONLY with valid JSON, no markdown):
{
  "improvements": [
    {
      "original": "<original bullet point or weak statement from resume>",
      "improved": "<STAR method improved version with metrics>",
      "type": "bullet"
    }
  ],
  "suggestedTitle": "<professional resume title/headline>",
  "projectIdeas": [
    "<project idea 1 relevant to target role>",
    "<project idea 2>",
    "<project idea 3>",
    "<project idea 4>",
    "<project idea 5>"
  ]
}

Include 4-5 bullet point improvements and 5 project ideas.`;

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

    let improvements;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      improvements = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI improvements response");
    }

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
