import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  FileSearch,
  Brain
} from 'lucide-react';

interface AnalysisResult {
  atsScore: number;
  skillMatchScore: number;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
}

interface ResumeScoreCardProps {
  analysis: AnalysisResult;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

const getScoreIcon = (score: number) => {
  if (score >= 80) return CheckCircle;
  if (score >= 60) return AlertTriangle;
  return XCircle;
};

const ResumeScoreCard = ({ analysis }: ResumeScoreCardProps) => {
  const AtsIcon = getScoreIcon(analysis.atsScore);
  const SkillIcon = getScoreIcon(analysis.skillMatchScore);

  return (
    <div className="space-y-6">
      {/* Main Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* ATS Score */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <AtsIcon className={`h-6 w-6 ${getScoreColor(analysis.atsScore)}`} />
            </div>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.atsScore)}`}>
              {analysis.atsScore}
            </div>
            <p className="text-sm text-muted-foreground mb-3">ATS Compatibility</p>
            <Progress value={analysis.atsScore} className="h-2" />
          </CardContent>
        </Card>

        {/* Skill Match Score */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <SkillIcon className={`h-6 w-6 ${getScoreColor(analysis.skillMatchScore)}`} />
            </div>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.skillMatchScore)}`}>
              {analysis.skillMatchScore}
            </div>
            <p className="text-sm text-muted-foreground mb-3">Skill Match</p>
            <Progress value={analysis.skillMatchScore} className="h-2" />
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Brain className="h-5 w-5 text-success" />
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">{analysis.experienceLevel}</div>
            <p className="text-sm text-muted-foreground mb-3">Experience Level</p>
            <Badge variant={
              analysis.experienceLevel === 'Advanced' ? 'default' :
              analysis.experienceLevel === 'Intermediate' ? 'secondary' : 'outline'
            }>
              {analysis.experienceLevel === 'Advanced' ? '5+ Years' :
               analysis.experienceLevel === 'Intermediate' ? '2-5 Years' : '0-2 Years'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Missing Skills */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Missing Keywords & Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-destructive/5 border-destructive/30 text-destructive">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="border-border/50 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeScoreCard;
