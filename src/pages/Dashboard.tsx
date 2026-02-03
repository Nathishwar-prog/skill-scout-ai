import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import JDAnalysisResults from '@/components/dashboard/JDAnalysisResults';
import ResumeImprovements from '@/components/dashboard/ResumeImprovements';
import ResumeBuilder from '@/components/dashboard/ResumeBuilder';
import AnalysisHistory from '@/components/dashboard/AnalysisHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  TrendingUp,
  Target,
  BarChart3,
  ChevronRight,
  Upload,
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  // New states for regenerate and resume builder
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [improvedResume, setImprovedResume] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleResumeUpload = async (content: string, jd: string, fileName?: string) => {
    setIsAnalyzing(true);
    setResumeText(content);
    setJobDescription(jd);
    setImprovedResume(null); // Clear any previous built resume

    try {
      // DEBUG: Force use of generated key to rule out session issues
      const token = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      console.log("Using Auth Token:", token?.substring(0, 10) + "...");

      // Sanitize inputs to remove null bytes (Postgres error 22P05)
      const cleanResume = content.replace(/\0/g, '');
      const cleanJD = jd.replace(/\0/g, '');

      // Call the AI-powered JD comparison edge function
      const { data, error } = await supabase.functions.invoke('compare-jd', {
        body: { resumeText: cleanResume, jobDescription: cleanJD },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze resume');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const analysisResult = data.analysis;
      setJdAnalysis(analysisResult);

      // Save to history
      if (user) {
        const { error: saveError } = await supabase
          .from('analysis_history')
          .insert({
            user_id: user.id,
            resume_text: cleanResume,
            job_description: cleanJD,
            analysis_results: analysisResult
          });

        if (saveError) {
          console.error('Failed to save analysis:', saveError);
        }
      }

      // Also fetch improvements
      const { data: improveData, error: improveError } = await supabase.functions.invoke('improve-resume', {
        body: { resumeText: content, targetRole: jd.substring(0, 500) },
        headers: {
          Authorization: `Bearer ${token}`
        }
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
        description: 'Your resume has been analyzed against the job description.'
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

  const handleSelectHistoryAnalysis = (record: any) => {
    setResumeText(record.resume_text);
    setJobDescription(record.job_description);
    setJdAnalysis(record.analysis_results);
    setImprovements(null); // Clear improvements when loading from history
    setImprovedResume(null); // Clear built resume
    setActiveTab('overview');
    toast({
      title: 'Analysis Loaded',
      description: 'Viewing saved analysis from history'
    });
  };

  // Regenerate improvements for historical analysis
  const handleRegenerateImprovements = async () => {
    if (!resumeText) {
      toast({
        title: 'No Resume Available',
        description: 'Please upload a resume first.',
        variant: 'destructive'
      });
      return;
    }

    setIsRegenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const { data, error } = await supabase.functions.invoke('improve-resume', {
        body: { resumeText, targetRole: jobDescription?.substring(0, 500) },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate improvements');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setImprovements({
        improvements: data.improvements,
        suggestedTitle: data.suggestedTitle,
        projectIdeas: data.projectIdeas
      });

      toast({
        title: 'Improvements Generated!',
        description: 'AI suggestions are ready for review.'
      });
    } catch (error: any) {
      console.error('Generate improvements error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate improvements.',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Generate improved resume with all suggestions applied
  const handleGenerateImprovedResume = async () => {
    if (!resumeText || !improvements) {
      toast({
        title: 'Missing Data',
        description: 'Resume and improvements are required.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingResume(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const { data, error } = await supabase.functions.invoke('generate-improved-resume', {
        body: {
          originalResume: resumeText,
          improvements: improvements.improvements,
          suggestedTitle: improvements.suggestedTitle,
          targetRole: jobDescription?.substring(0, 500)
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to build resume');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setImprovedResume({
        improvedResume: data.improvedResume,
        sections: data.sections
      });

      toast({
        title: 'Resume Built!',
        description: 'Your improved resume is ready to download.'
      });
    } catch (error: any) {
      console.error('Build resume error:', error);
      toast({
        title: 'Build Failed',
        description: error.message || 'Could not build improved resume.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingResume(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {jdAnalysis ? (
            <>
              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{jdAnalysis.atsScore}</p>
                      <p className="text-sm text-muted-foreground">ATS Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Target className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{jdAnalysis.jobMatchPercentage}%</p>
                      <p className="text-sm text-muted-foreground">Job Match</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-success/10">
                      <Zap className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{jdAnalysis.skillMatchPercentage}%</p>
                      <p className="text-sm text-muted-foreground">Skill Match</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-warning/10">
                      <BarChart3 className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{jdAnalysis.similarityScore}%</p>
                      <p className="text-sm text-muted-foreground">Similarity</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Readiness */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Overall Job Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress
                      value={Math.round(
                        (jdAnalysis.atsScore +
                          jdAnalysis.jobMatchPercentage +
                          jdAnalysis.skillMatchPercentage +
                          jdAnalysis.similarityScore) / 4
                      )}
                      className="h-4 flex-1"
                    />
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(
                        (jdAnalysis.atsScore +
                          jdAnalysis.jobMatchPercentage +
                          jdAnalysis.skillMatchPercentage +
                          jdAnalysis.similarityScore) / 4
                      )}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on ATS score, job match, skill match, and similarity analysis
                  </p>
                </CardContent>
              </Card>

              {/* Full Analysis */}
              <JDAnalysisResults analysis={jdAnalysis} />

              {/* Analyze New */}
              <Card className="border-border/50 bg-muted/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Want to analyze for a different job?</p>
                    <p className="text-sm text-muted-foreground">Upload your resume with a new job description</p>
                  </div>
                  <Button onClick={() => setActiveTab('upload')} variant="outline">
                    New Analysis
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border/50 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Resume Analyzed Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Upload your resume and paste a job description to get AI-powered analysis including ATS score, skill match, and gap analysis
                </p>
                <Button onClick={() => setActiveTab('upload')} className="gradient-primary">
                  Start Analysis
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
        jdAnalysis ? (
          <JDAnalysisResults analysis={jdAnalysis} />
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Resume First</h3>
              <p className="text-muted-foreground mb-6">
                Analyze your resume against a job description to see detailed match analysis
              </p>
              <Button onClick={() => setActiveTab('upload')} variant="outline">
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {activeTab === 'improvements' && (
        improvedResume ? (
          <ResumeBuilder
            improvedResume={improvedResume.improvedResume}
            sections={improvedResume.sections}
            onClose={() => setImprovedResume(null)}
          />
        ) : improvements ? (
          <ResumeImprovements
            {...improvements}
            onBuildResume={handleGenerateImprovedResume}
            isBuilding={isGeneratingResume}
          />
        ) : resumeText ? (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate AI Improvements</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get AI-powered suggestions to improve your resume bullet points using the STAR method
              </p>
              <Button
                onClick={handleRegenerateImprovements}
                disabled={isRegenerating}
                className="gradient-primary"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Improvements
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-16 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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

      {activeTab === 'history' && (
        <AnalysisHistory onSelectAnalysis={handleSelectHistoryAnalysis} />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
