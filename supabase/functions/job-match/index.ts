import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

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

const systemPrompt = `You are a career advisor.
You must follow instructions strictly.
You must output valid JSON only.`;

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

    const maxChars = 5000;
    const truncatedResume = resumeText.length > maxChars ? resumeText.substring(0, maxChars) + "..." : resumeText;

    const userPrompt = `
<<<RESUME>>>
${truncatedResume}
<<<END>>>

<<<TARGET_ROLES>>>
${rolesDescription}
<<<END>>>

TASK:
Analyze the resume for job role matches against the target roles.
Be realistic.

RULES:
- Do not include markdown
- Do not include explanations
- Output valid JSON only
- Follow this exact JSON structure:
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
}
`;

    // Call Ollama
    const taskType = "structured_analysis"; // Routes to Phi3 for structured matching
    const rawResponse = await generateOllamaResponse(systemPrompt, userPrompt, taskType);

    // Parse JSON safely
    const jobMatches = await parseJsonWithRetry(rawResponse, async () => {
      console.log("Retrying JSON generation for job-match...");
      return await generateOllamaResponse(systemPrompt, userPrompt + "\n\nIMPORTANT: Your previous response was invalid JSON. Output ONLY valid JSON now.", taskType);
    });

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
