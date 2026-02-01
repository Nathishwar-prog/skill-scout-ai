import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const roles = [
  { id: 'frontend', name: 'Frontend Developer', skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML', 'Next.js', 'Tailwind', 'Testing'] },
  { id: 'backend', name: 'Backend Developer', skills: ['Node.js', 'Python', 'Java', 'SQL', 'APIs', 'Docker', 'AWS', 'Microservices'] },
  { id: 'data', name: 'Data Analyst', skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics', 'R', 'Data Visualization', 'ETL'] },
  { id: 'ai', name: 'AI Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'ML', 'NLP', 'Deep Learning', 'MLOps', 'Computer Vision'] },
  { id: 'design', name: 'Product Designer', skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research', 'Design Systems', 'Adobe XD', 'Wireframing'] },
];

const systemPrompt = `You are a career advisor who matches resumes to job roles. Analyze the resume and determine how well it matches each target role.

Consider:
1. Relevant skills present vs required
2. Experience alignment
3. Project relevance
4. Education fit

Be realistic - if someone has no relevant experience for a role, the match should be low.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, selectedRole } = await req.json();

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

    const rolesToAnalyze = selectedRole 
      ? roles.filter(r => r.id === selectedRole || r.name.toLowerCase().includes(selectedRole.toLowerCase()))
      : roles;

    if (rolesToAnalyze.length === 0) {
      // Custom role
      rolesToAnalyze.push({ id: selectedRole, name: selectedRole, skills: [] });
    }

    const rolesDescription = rolesToAnalyze.map(r => 
      `- ${r.name} (id: ${r.id}): Key skills: ${r.skills.join(', ')}`
    ).join('\n');

    const userPrompt = `Analyze this resume for job role matches:

${resumeText}

Target roles to evaluate:
${rolesDescription}

Return ONLY valid JSON (no markdown) in this format:
{
  "matches": [
    {
      "roleId": "<role id>",
      "roleName": "<role name>",
      "matchPercentage": <0-100>,
      "missingSkills": ["<skill1>", "<skill2>", ...up to 5],
      "roadmap": [
        "<step 1 with timeframe>",
        "<step 2 with timeframe>",
        "<step 3 with timeframe>",
        "<step 4 with timeframe>"
      ]
    }
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

    let jobMatches;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      jobMatches = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse job matching response");
    }

    return new Response(
      JSON.stringify({ success: true, ...jobMatches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Job matching error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
