import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and hiring manager. Your job is to compare a candidate's resume against a specific job description and provide detailed matching analysis.

You must evaluate:
1. ATS Score (0-100): How well the resume would pass automated screening systems for this specific job
2. Job Match Percentage (0-100): Overall alignment between candidate qualifications and job requirements
3. Skill Match Percentage (0-100): How many required skills from the JD the candidate possesses
4. Similarity Score (0-100): Semantic similarity between resume content and JD expectations
5. Detailed Skill Gap Analysis: Skills required by JD but missing/weak in resume

Be strict and realistic. Real ATS systems are harsh. Consider:
- Exact keyword matches vs semantic matches
- Years of experience requirements
- Required vs preferred qualifications
- Industry-specific terminology`;

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Compare this resume against the job description and provide detailed analysis.

=== JOB DESCRIPTION ===
${jobDescription}

=== RESUME ===
${resumeText}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "atsScore": <number 0-100>,
  "jobMatchPercentage": <number 0-100>,
  "skillMatchPercentage": <number 0-100>,
  "similarityScore": <number 0-100>,
  "overallVerdict": "<Strong Match|Good Match|Moderate Match|Weak Match|Poor Match>",
  "verdictExplanation": "<2-3 sentence summary of the match quality>",
  "requiredSkillsFromJD": ["<skill1>", "<skill2>", ...list all skills mentioned in JD],
  "matchedSkills": ["<skill1>", "<skill2>", ...skills candidate has that match JD],
  "missingSkills": ["<skill1>", "<skill2>", ...skills required by JD but missing in resume],
  "partialSkills": ["<skill1>", "<skill2>", ...skills mentioned but need more depth],
  "skillGapAnalysis": {
    "critical": [
      {"skill": "<skill name>", "importance": "critical", "recommendation": "<specific action to address>"}
    ],
    "important": [
      {"skill": "<skill name>", "importance": "important", "recommendation": "<specific action to address>"}
    ],
    "nice_to_have": [
      {"skill": "<skill name>", "importance": "nice_to_have", "recommendation": "<specific action to address>"}
    ]
  },
  "experienceAnalysis": {
    "requiredYears": "<X years or entry-level>",
    "candidateYears": "<estimated years based on resume>",
    "experienceMatch": "<Exceeds|Meets|Below|Significantly Below>",
    "relevantExperience": ["<relevant experience 1>", "<relevant experience 2>"]
  },
  "keywordAnalysis": {
    "matchedKeywords": ["<keyword1>", "<keyword2>", ...],
    "missingKeywords": ["<keyword1>", "<keyword2>", ...important JD keywords not in resume],
    "keywordDensityScore": <number 0-100>
  },
  "recommendations": [
    "<specific actionable recommendation 1>",
    "<specific actionable recommendation 2>",
    "<specific actionable recommendation 3>",
    "<specific actionable recommendation 4>",
    "<specific actionable recommendation 5>"
  ],
  "strengths": [
    "<strength 1 relative to this JD>",
    "<strength 2 relative to this JD>",
    "<strength 3 relative to this JD>"
  ],
  "weaknesses": [
    "<weakness 1 relative to this JD>",
    "<weakness 2 relative to this JD>",
    "<weakness 3 relative to this JD>"
  ]
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

    let analysis;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse JD comparison response");
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
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
