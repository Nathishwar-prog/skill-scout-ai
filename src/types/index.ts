// Type definitions for Skill Scout AI

export interface JDAnalysisResult {
  atsScore: number;
  jobMatchPercentage: number;
  skillMatchPercentage: number;
  similarityScore: number;
  overallVerdict: string;
  verdictExplanation: string;
  requiredSkillsFromJD: string[];
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  skillGapAnalysis: {
    critical: Array<{ skill: string; importance: string; recommendation: string }>;
    important: Array<{ skill: string; importance: string; recommendation: string }>;
    nice_to_have: Array<{ skill: string; importance: string; recommendation: string }>;
  };
  experienceAnalysis: {
    requiredYears: string;
    candidateYears: string;
    experienceMatch: string;
    relevantExperience: string[];
  };
  keywordAnalysis: {
    matchedKeywords: string[];
    missingKeywords: string[];
    keywordDensityScore: number;
  };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  _debug_pipeline?: {
    jd_chunks: number;
    facts_extracted: number;
  };
}

export interface ResumeImprovements {
  improvements: Array<{
    original: string;
    improved: string;
    type: "summary" | "title" | "bullet";
  }>;
  suggestedTitle: string;
  projectIdeas: string[];
}

export interface ImprovedResume {
  improvedResume: string;
  sections: {
    header: any;
    summary: any;
    experience: any;
    skills: any;
    education: any;
  };
}

export interface AnalysisHistoryRecord {
  id: string;
  user_id: string;
  resume_text: string;
  job_description: string;
  analysis_results: JDAnalysisResult;
  created_at: string;
}
