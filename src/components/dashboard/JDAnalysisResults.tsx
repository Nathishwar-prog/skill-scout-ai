import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Target,
  BarChart3,
  Zap,
  Brain,
  TrendingUp,
  FileSearch,
  Lightbulb,
  Clock
} from 'lucide-react';

interface SkillGapItem {
  skill: string;
  importance: string;
  recommendation: string;
}

interface JDAnalysis {
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
    critical: SkillGapItem[];
    important: SkillGapItem[];
    nice_to_have: SkillGapItem[];
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
}

interface JDAnalysisResultsProps {
  analysis: JDAnalysis;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return 'bg-success/10';
  if (score >= 60) return 'bg-warning/10';
  return 'bg-destructive/10';
};

const getVerdictColor = (verdict: string) => {
  if (verdict.includes('Strong')) return 'bg-success text-success-foreground';
  if (verdict.includes('Good')) return 'bg-success/80 text-success-foreground';
  if (verdict.includes('Moderate')) return 'bg-warning text-warning-foreground';
  if (verdict.includes('Weak')) return 'bg-destructive/80 text-destructive-foreground';
  return 'bg-destructive text-destructive-foreground';
};

const JDAnalysisResults = ({ analysis }: JDAnalysisResultsProps) => {
  // Safe defaults for arrays that might be undefined
  const matchedSkills = analysis.matchedSkills ?? [];
  const missingSkills = analysis.missingSkills ?? [];
  const partialSkills = analysis.partialSkills ?? [];
  const requiredSkillsFromJD = analysis.requiredSkillsFromJD ?? [];
  const recommendations = analysis.recommendations ?? [];
  const strengths = analysis.strengths ?? [];
  const weaknesses = analysis.weaknesses ?? [];
  const skillGapAnalysis = {
    critical: analysis.skillGapAnalysis?.critical ?? [],
    important: analysis.skillGapAnalysis?.important ?? [],
    nice_to_have: analysis.skillGapAnalysis?.nice_to_have ?? [],
  };
  const experienceAnalysis = {
    requiredYears: analysis.experienceAnalysis?.requiredYears ?? 'N/A',
    candidateYears: analysis.experienceAnalysis?.candidateYears ?? 'N/A',
    experienceMatch: analysis.experienceAnalysis?.experienceMatch ?? 'N/A',
    relevantExperience: analysis.experienceAnalysis?.relevantExperience ?? [],
  };
  const keywordAnalysis = {
    matchedKeywords: analysis.keywordAnalysis?.matchedKeywords ?? [],
    missingKeywords: analysis.keywordAnalysis?.missingKeywords ?? [],
    keywordDensityScore: analysis.keywordAnalysis?.keywordDensityScore ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Overall Verdict Banner */}
      <Card className={`border-2 ${
        analysis.overallVerdict.includes('Strong') ? 'border-success bg-success/5' :
        analysis.overallVerdict.includes('Good') ? 'border-success/70 bg-success/5' :
        analysis.overallVerdict.includes('Moderate') ? 'border-warning bg-warning/5' :
        'border-destructive bg-destructive/5'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Badge className={`${getVerdictColor(analysis.overallVerdict)} text-lg px-4 py-1`}>
                {analysis.overallVerdict}
              </Badge>
              <p className="text-muted-foreground mt-2 max-w-2xl">{analysis.verdictExplanation}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Overall Match</p>
              <p className={`text-4xl font-bold ${getScoreColor(analysis.jobMatchPercentage)}`}>
                {analysis.jobMatchPercentage}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Score Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* ATS Score */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getScoreBgColor(analysis.atsScore)}`}>
                <FileSearch className={`h-5 w-5 ${getScoreColor(analysis.atsScore)}`} />
              </div>
              {analysis.atsScore >= 80 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : analysis.atsScore >= 60 ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(analysis.atsScore)}`}>
              {analysis.atsScore}
            </p>
            <p className="text-sm text-muted-foreground">ATS Score</p>
            <Progress value={analysis.atsScore} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Job Match */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getScoreBgColor(analysis.jobMatchPercentage)}`}>
                <Target className={`h-5 w-5 ${getScoreColor(analysis.jobMatchPercentage)}`} />
              </div>
              {analysis.jobMatchPercentage >= 80 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : analysis.jobMatchPercentage >= 60 ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(analysis.jobMatchPercentage)}`}>
              {analysis.jobMatchPercentage}%
            </p>
            <p className="text-sm text-muted-foreground">Job Match</p>
            <Progress value={analysis.jobMatchPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Skill Match */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getScoreBgColor(analysis.skillMatchPercentage)}`}>
                <Zap className={`h-5 w-5 ${getScoreColor(analysis.skillMatchPercentage)}`} />
              </div>
              {analysis.skillMatchPercentage >= 80 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : analysis.skillMatchPercentage >= 60 ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(analysis.skillMatchPercentage)}`}>
              {analysis.skillMatchPercentage}%
            </p>
            <p className="text-sm text-muted-foreground">Skill Match</p>
            <Progress value={analysis.skillMatchPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Similarity Score */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getScoreBgColor(analysis.similarityScore)}`}>
                <BarChart3 className={`h-5 w-5 ${getScoreColor(analysis.similarityScore)}`} />
              </div>
              {analysis.similarityScore >= 80 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : analysis.similarityScore >= 60 ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(analysis.similarityScore)}`}>
              {analysis.similarityScore}%
            </p>
            <p className="text-sm text-muted-foreground">Similarity</p>
            <Progress value={analysis.similarityScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Matched Skills ({matchedSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-success/10 border-success/30 text-success">
                  {skill}
                </Badge>
              ))}
              {matchedSkills.length === 0 && (
                <p className="text-sm text-muted-foreground">No direct skill matches found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Missing Skills ({missingSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-destructive/10 border-destructive/30 text-destructive">
                  {skill}
                </Badge>
              ))}
              {missingSkills.length === 0 && (
                <p className="text-sm text-muted-foreground">No missing skills - great match!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Gap Analysis */}
      {(skillGapAnalysis.critical.length > 0 || 
        skillGapAnalysis.important.length > 0 ||
        skillGapAnalysis.nice_to_have.length > 0) && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Critical Skills */}
            {skillGapAnalysis.critical.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Skills to Address
                </h4>
                <div className="space-y-2">
                  {skillGapAnalysis.critical.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Skills */}
            {skillGapAnalysis.important.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Important Skills to Improve
                </h4>
                <div className="space-y-2">
                  {skillGapAnalysis.important.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <Badge className="bg-warning text-warning-foreground text-xs">Important</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nice to Have */}
            {skillGapAnalysis.nice_to_have.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Nice to Have
                </h4>
                <div className="space-y-2">
                  {skillGapAnalysis.nice_to_have.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.skill}</span>
                        <Badge variant="outline" className="text-xs">Nice to Have</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experience Analysis */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Experience Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Required</p>
              <p className="font-semibold">{experienceAnalysis.requiredYears}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Your Experience</p>
              <p className="font-semibold">{experienceAnalysis.candidateYears}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Match Level</p>
              <p className={`font-semibold ${
                experienceAnalysis.experienceMatch === 'Exceeds' ? 'text-success' :
                experienceAnalysis.experienceMatch === 'Meets' ? 'text-success' :
                experienceAnalysis.experienceMatch === 'Below' ? 'text-warning' :
                'text-destructive'
              }`}>
                {experienceAnalysis.experienceMatch}
              </p>
            </div>
          </div>
          {experienceAnalysis.relevantExperience.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Relevant Experience:</p>
              <ul className="space-y-1">
                {experienceAnalysis.relevantExperience.map((exp, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Keyword Analysis
            <Badge variant="outline" className="ml-2">
              Density: {keywordAnalysis.keywordDensityScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-success mb-2">Matched Keywords</p>
              <div className="flex flex-wrap gap-1">
                {keywordAnalysis.matchedKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-success/5">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-destructive mb-2">Missing Keywords</p>
              <div className="flex flex-wrap gap-1">
                {keywordAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-destructive/5">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Your Strengths for This Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Areas to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-border/50 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Recommendations to Improve Your Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default JDAnalysisResults;
