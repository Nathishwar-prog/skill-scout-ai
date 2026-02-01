import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import ResumeScoreCard from '@/components/dashboard/ResumeScoreCard';
import JobMatching from '@/components/dashboard/JobMatching';
import ResumeImprovements from '@/components/dashboard/ResumeImprovements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  Upload
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [improvements, setImprovements] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleResumeUpload = async (content: string, fileName?: string) => {
    setIsAnalyzing(true);
    setResumeText(content);
    
    try {
      // Call the AI-powered resume analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText: content }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze resume');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data.analysis);
      
      // Also fetch job matches
      const { data: matchData, error: matchError } = await supabase.functions.invoke('job-match', {
        body: { resumeText: content }
      });

      if (!matchError && matchData.matches) {
        setJobMatches(matchData.matches);
      }

      // And fetch improvements
      const { data: improveData, error: improveError } = await supabase.functions.invoke('improve-resume', {
        body: { resumeText: content }
      });

      if (!improveError && improveData.improvements) {
        setImprovements({
          improvements: improveData.improvements,
          suggestedTitle: improveData.suggestedTitle,
          projectIdeas: improveData.projectIdeas
        });
      }

      setActiveTab('overview');
      toast({ 
        title: 'Analysis Complete!', 
        description: 'Your resume has been analyzed by AI.' 
      });

    } catch (error: any) {
      console.error('Resume analysis error:', error);
      toast({ 
        title: 'Analysis Failed', 
        description: error.message || 'Could not analyze resume. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRoleSelect = async (roleId: string) => {
    if (!resumeText) return;

    try {
      const { data, error } = await supabase.functions.invoke('job-match', {
        body: { resumeText, selectedRole: roleId }
      });

      if (!error && data.matches) {
        // Update matches with focused role analysis
        setJobMatches(prevMatches => {
          const newMatch = data.matches.find((m: any) => m.roleId === roleId);
          if (newMatch) {
            const existingIndex = prevMatches.findIndex(m => m.roleId === roleId);
            if (existingIndex >= 0) {
              const updated = [...prevMatches];
              updated[existingIndex] = newMatch;
              return updated;
            }
            return [...prevMatches, newMatch];
          }
          return prevMatches;
        });
      }
    } catch (error) {
      console.error('Role match error:', error);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {analysisResult ? (
            <>
              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analysisResult.atsScore}</p>
                      <p className="text-sm text-muted-foreground">ATS Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{analysisResult.skillMatchScore}%</p>
                      <p className="text-sm text-muted-foreground">Skill Match</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10">
                      <Target className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{jobMatches.filter(j => j.matchPercentage >= 70).length}</p>
                      <p className="text-sm text-muted-foreground">Strong Matches</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning/10">
                      <Clock className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">Today</p>
                      <p className="text-sm text-muted-foreground">Last Analysis</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Readiness */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Job Readiness Meter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={(analysisResult.atsScore + analysisResult.skillMatchScore) / 2} className="h-4 flex-1" />
                    <span className="text-2xl font-bold text-primary">
                      {Math.round((analysisResult.atsScore + analysisResult.skillMatchScore) / 2)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on ATS score and skill match analysis
                  </p>
                </CardContent>
              </Card>

              {/* Score Card */}
              <ResumeScoreCard analysis={analysisResult} />
            </>
          ) : (
            <Card className="border-border/50 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Resume Analyzed Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your resume to get started with AI-powered analysis
                </p>
                <Button onClick={() => setActiveTab('upload')} className="gradient-primary">
                  Upload Resume
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'upload' && (
        <ResumeUpload onUpload={handleResumeUpload} isLoading={isAnalyzing} />
      )}

      {activeTab === 'job-match' && (
        jobMatches.length > 0 ? (
          <JobMatching onSelectRole={handleRoleSelect} jobMatches={jobMatches} />
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Resume First</h3>
              <p className="text-muted-foreground mb-6">
                Analyze your resume to see job role matches
              </p>
              <Button onClick={() => setActiveTab('upload')} variant="outline">
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {activeTab === 'improvements' && (
        improvements ? (
          <ResumeImprovements {...improvements} />
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Resume First</h3>
              <p className="text-muted-foreground mb-6">
                Analyze your resume to get AI improvement suggestions
              </p>
              <Button onClick={() => setActiveTab('upload')} variant="outline">
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        )
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
