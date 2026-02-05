import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateOllamaResponse, parseJsonWithRetry } from "../_shared/ollama-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- STAGE 1: STRUCTURED EXTRACTION (New Scanner) ---
async function extractStructuredResume(resumeText: string): Promise<any> {
  const systemPrompt = `You are an expert Resume Parser. 
  Extract all information into a strict JSON format. 
  Capture every skill, job role, and project. Do not summarize or lose details.
  Ensure dates, companies, and job titles are preserved exactly.`;

  const userPrompt = `
  RESUME TEXT:
  "${resumeText}"
  
  OUTPUT JSON SCHEMA:
  {
    "personal_info": { "name": "string", "email": "string", "summary": "string" },
    "total_experience_years": number,
    "skills": ["skill1", "skill2"],
    "experience": [
      { 
        "role": "string", 
        "company": "string", 
        "duration": "string", 
        "description": "string (bullet points combined)",
        "technologies_used": ["tech1"] 
      }
    ],
    "education": [ { "degree": "string", "institution": "string", "year": "string" } ],
    "projects": [ { "name": "string", "description": "string", "tech_stack": ["tech1"] } ]
  }`;

  return await parseJsonWithRetry(
    await generateOllamaResponse(systemPrompt, userPrompt, "structured_resume")
  );
}

// --- STAGE 2: STRUCTURED JD EXTRACTION (New Rulebook) ---
async function extractStructuredJD(jdText: string): Promise<any> {
  const systemPrompt = `You are an expert Job Analyst.
  Extract strict requirements from the Job Description.
  Determine if "Freshers" are allowed.
  Extract strict years of experience required (integers only).`;

  const userPrompt = `
  JOB DESCRIPTION:
  "${jdText}"
  
  OUTPUT JSON SCHEMA:
  {
    "job_title": "string",
    "is_fresher_job": boolean,
    "required_experience_years": number,
    "primary_keywords": ["important skill 1", "important skill 2"],
    "secondary_keywords": ["nice to have 1"],
    "degree_requirements": ["degree1"]
  }`;

  return await parseJsonWithRetry(
    await generateOllamaResponse(systemPrompt, userPrompt, "structured_resume")
  );
}

// --- STAGE 0: NORMALIZATION ---
function normalizeText(text: string): string {
  if (!text) return "";
  const t = String(text); // Ensure string
  return t
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

// --- STAGE 1: SEMANTIC CHUNKING ---
function chunkText(text: string, source: 'resume' | 'jd'): Array<{ id: string, text: string, source: string }> {
  const MAX_WORDS = 300;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  const chunks: Array<{ id: string, text: string, source: string }> = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).length;
    if (currentWordCount + wordCount > MAX_WORDS && currentChunk.length > 0) {
      chunks.push({
        id: `${source}_${chunkIndex++}`,
        text: currentChunk.join(" ").trim(),
        source
      });
      currentChunk = [];
      currentWordCount = 0;
    }
    currentChunk.push(sentence);
    currentWordCount += wordCount;
  }

  if (currentChunk.length > 0) {
    chunks.push({
      id: `${source}_${chunkIndex++}`,
      text: currentChunk.join(" ").trim(),
      source
    });
  }

  return chunks;
}

// --- STAGE 2: SBERT FILTERING ---
async function retrieveTopResumeChunks(jdChunk: string, resumeChunks: string[], topK: number = 3): Promise<number[]> {
  try {
    const response = await fetch("http://host.docker.internal:8000/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: jdChunk,
        candidates: resumeChunks,
        top_k: topK
      })
    });

    if (!response.ok) {
      console.error("SBERT Rank Error:", await response.text());
      return resumeChunks.map((_, i) => i); // Fallback: return all indices if rank fails
    }

    const data = await response.json();
    return data.ranked_results.map((r: any) => r.index);
  } catch (e) {
    console.error("SBERT Rank Exception:", e);
    return resumeChunks.map((_, i) => i); // Fallback
  }
}

// --- STAGE 3: FACT EXTRACTION (PHI) ---
async function extractFacts(jdChunk: string, relevantResumeChunks: string[]): Promise<any> {
  const context = relevantResumeChunks.join("\n---\n");

  const systemPrompt = `You are a strict information extraction engine.
Extract ONLY verifiable facts. No opinions.
If evidence is missing, do NOT infer.`;

  const userPrompt = `
JD CHUNK:
"${jdChunk}"

RESUME CONTEXT:
"${context}"

TASK:
Extract requirements from JD and find specific evidence in Resume.

OUTPUT JSON:
{
  "jd_requirements": {
    "skills": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "responsibilities": ["resp1", "resp2"],
    "experience_years": "X years"
  },
  "resume_evidence": [
    {
      "source": "experience|project|skills",
      "skill_or_tool": "name",
      "evidence_text": "quote from resume",
      "confidence": "strong|weak"
    }
  ]
}`;

  return await parseJsonWithRetry(
    await generateOllamaResponse(systemPrompt, userPrompt, "fact_extraction")
  );
}

// --- STAGE 2: STRUCTURED MATCHING (New Judge) ---
async function matchStructuredAnalysis(structuredResume: any, jobDescription: string): Promise<any> {
  const systemPrompt = `You are a senior technical recruiter. 
Compare the candidate's structured profile against the Job Description.
Provide a detailed gap analysis and scoring verdict.`;

  const userPrompt = `
JOB DESCRIPTION:
"${jobDescription}"

CANDIDATE PROFILE (STRUCTURED):
${JSON.stringify(structuredResume, null, 2)}

TASK:
1. Analyze if the candidate's specific experience matches the JD requirements.
2. Check for missing critical skills.
3. Validate if the "Years of Experience" match.

OUTPUT JSON:
{
  "skill_match": [
    { "skill": "name", "match_level": "Strong|Partial|Weak|Missing", "justification": "evidence from experience" }
  ],
  "experience_gaps": ["gap1"],
  "tool_gaps": ["gap1"],
  "role_alignment_notes": ["note1"],
  "keyword_analysis": {
    "matched_keywords": ["k1"],
    "missing_keywords": ["k2"]
  }
}`;

  return await parseJsonWithRetry(
    await generateOllamaResponse(systemPrompt, userPrompt, "complex_matching")
  );
}

// --- STAGE 5: MATCHING (MISTRAL) ---
async function matchSkillsAndExperience(aggregatedData: any): Promise<any> {
  const systemPrompt = `You are a senior technical recruiter and evaluator.
Analyze the aggregated data to provide a final matching assessment.`;

  const userPrompt = `
AGGREGATED DATA:
${JSON.stringify(aggregatedData, null, 2)}

TASK:
1. Classify EACH skill match (Strong, Partial, Weak, Missing).
2. Analyze experience gaps.
3. specific tool mismatches.

OUTPUT JSON:
{
  "skill_match": [
    { "skill": "name", "match_level": "Strong|Partial|Weak|Missing", "justification": "reason" }
  ],
  "experience_gaps": ["gap1", "gap2"],
  "tool_gaps": ["gap1"],
  "role_alignment_notes": ["note1"]
}`;

  return await parseJsonWithRetry(
    await generateOllamaResponse(systemPrompt, userPrompt, "complex_matching")
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, jobDescription } = await req.json();

    console.log("--- DEBUG: FUNCTION RELOADED WITH NEW SHARED CLIENT ---");

    if (!resumeText || !jobDescription) {
      throw new Error("Missing inputs");
    }

    // STAGE 0
    let normResume = "";
    let normJD = "";
    try {
      console.log("--- DEBUG: RECEIVING RESUME ---");
      console.log("Raw Resume Length:", resumeText ? resumeText.length : "N/A");

      normResume = normalizeText(resumeText);
      normJD = normalizeText(jobDescription);

      console.log("--- DEBUG: NORMALIZATION ---");
      console.log("Normalized Resume Length:", normResume.length);
    } catch (e) {
      console.error("Stage 0 Normalization Error:", e);
      throw e;
    }

    // --- NEW PIPELINE EXECUTION ---

    console.log("--- DEBUG: STARTING EXTRACT-FIRST PIPELINE ---");

    // STAGE 1: FULL EXTRACTION
    let structuredResume;
    let structuredJD;
    try {
      console.log("--- DEBUG: Extracting Structured Data ---");
      structuredResume = await extractStructuredResume(normResume);

      try {
        console.log("--- DEBUG: Extracting JD Data ---");
        structuredJD = await extractStructuredJD(normJD);
      } catch (jdError) {
        console.warn("JD Extraction Failed, using defaults:", jdError);
        structuredJD = {
          job_title: "Unknown",
          is_fresher_job: false,
          required_experience_years: 0,
          primary_keywords: [],
          secondary_keywords: [],
          degree_requirements: []
        };
      }
      console.log("--- DEBUG: Extraction Complete ---");
    } catch (e) {
      console.error("Stage 1 Extraction Error:", e);
      throw e;
    }

    // STAGE 2: STRUCTURED MATCHING
    let matchAnalysis;
    try {
      console.log("--- DEBUG: Matching with JD ---");
      matchAnalysis = await matchStructuredAnalysis(structuredResume, normJD);
      console.log("--- DEBUG: Matching Complete ---");
    } catch (e) {
      console.error("Stage 2 Matching Error:", e);
      throw e;
    }

    // SCORING (Adapted for new output format)
    let skillsScore = 0;
    const totalSkills = matchAnalysis.skill_match?.length || 1;
    matchAnalysis.skill_match?.forEach((m: any) => {
      if (m.match_level === 'Strong') skillsScore += 1;
      else if (m.match_level === 'Partial') skillsScore += 0.5;
    });
    const normSkillsScore = (skillsScore / totalSkills) * 100;

    const expScore = Math.max(0, 100 - (matchAnalysis.experience_gaps?.length || 0) * 20);
    const toolsScore = Math.max(0, 100 - (matchAnalysis.tool_gaps?.length || 0) * 15);
    const roleScore = 80; // Baseline

    const finalScore = (normSkillsScore * 0.4) + (expScore * 0.3) + (roleScore * 0.2) + (toolsScore * 0.1);

    // FORMATTING FINAL REPORT
    const finalReport = {
      atsScore: Math.round(finalScore),
      jobMatchPercentage: Math.round(finalScore),
      skillMatchPercentage: Math.round(normSkillsScore),
      similarityScore: Math.round(finalScore),
      overallVerdict: finalScore > 80 ? 'Strong Match' : finalScore > 60 ? 'Good Match' : 'Weak Match',
      verdictExplanation: "Generated via VibeCodeAgent Extract-First Pipeline",

      // Use Structured Data for clean reporting
      requiredSkillsFromJD: matchAnalysis.skill_match?.map((m: any) => m.skill) || [],
      matchedSkills: matchAnalysis.skill_match?.filter((m: any) => m.match_level === 'Strong').map((m: any) => m.skill) || [],
      missingSkills: matchAnalysis.skill_match?.filter((m: any) => m.match_level === 'Missing').map((m: any) => m.skill) || [],
      partialSkills: matchAnalysis.skill_match?.filter((m: any) => m.match_level === 'Partial').map((m: any) => m.skill) || [],

      skillGapAnalysis: {
        critical: matchAnalysis.skill_match?.filter((m: any) => m.match_level === 'Missing').map((m: any) => ({
          skill: m.skill,
          importance: 'critical',
          recommendation: 'Learn this to improve match.'
        })) || []
      },

      experienceAnalysis: {
        requiredYears: structuredJD.required_experience_years ? `${structuredJD.required_experience_years} Years` : "Not Specified",
        candidateYears: structuredResume.total_experience_years ? `${structuredResume.total_experience_years} Years` : "0 Years",
        experienceMatch: (structuredResume.total_experience_years || 0) >= (structuredJD.required_experience_years || 0) ? "Meets" : "Below",
        relevantExperience: structuredResume.experience || [],
        notes: matchAnalysis.role_alignment_notes || []
      },

      keywordAnalysis: {
        matchedKeywords: matchAnalysis.keyword_analysis?.matched_keywords || [],
        missingKeywords: matchAnalysis.keyword_analysis?.missing_keywords || [],
        keywordDensityScore: (matchAnalysis.keyword_analysis?.matched_keywords?.length || 0) * 10
      },

      recommendations: [...(matchAnalysis.experience_gaps || []), ...(matchAnalysis.tool_gaps || [])],
      strengths: matchAnalysis.skill_match?.filter((m: any) => m.match_level === 'Strong').map((m: any) => m.skill) || [],
      weaknesses: matchAnalysis.tool_gaps || [],

      _debug_pipeline: {
        pipeline: "extract-first-v2",
        extraction_success: !!structuredResume,
        matching_success: !!matchAnalysis
      }
    };

    return new Response(
      JSON.stringify({ success: true, analysis: finalReport }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("VibeCodeAgent Pipeline Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in analysis pipeline"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
