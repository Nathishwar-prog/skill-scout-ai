import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import ResumeScoreCard from '@/components/dashboard/ResumeScoreCard';
import JobMatching from '@/components/dashboard/JobMatching';
import ResumeImprovements from '@/components/dashboard/ResumeImprovements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  Upload
} from 'lucide-react';
import { useEffect } from 'react';

// Mock AI analysis function (replace with actual API call)
const analyzeResume = async (content: string) => {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
  
  return {
    atsScore: 72,
    skillMatchScore: 65,
    experienceLevel: 'Intermediate' as const,
    strengths: [
      'Clear work history with quantifiable achievements',
      'Strong technical skills section with relevant technologies',
      'Good use of action verbs in bullet points',
      'Professional formatting and structure',
    ],
    weaknesses: [
      'Missing keywords for target roles (cloud, DevOps)',
      'Summary section could be more impactful',
      'Some bullet points lack measurable outcomes',
      'Education section needs more detail',
    ],
    missingSkills: [
      'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Agile', 'Scrum', 
      'TypeScript', 'GraphQL', 'Unit Testing', 'System Design'
    ],
    suggestions: [
      'Add a professional summary highlighting 3-5 years of experience and key achievements',
      'Include AWS or cloud certifications to boost ATS score by 15-20%',
      'Quantify achievements with metrics (e.g., "Reduced load time by 40%")',
      'Add relevant projects that demonstrate hands-on experience with modern tech stack',
      'Use industry-specific keywords throughout your experience section',
    ],
  };
};

const generateJobMatches = () => [
  {
    roleId: 'frontend',
    roleName: 'Frontend Developer',
    matchPercentage: 78,
    missingSkills: ['TypeScript', 'Next.js', 'Testing Library', 'Storybook'],
    roadmap: [
      'Complete TypeScript fundamentals course (2 weeks)',
      'Build a Next.js project with SSR/SSG (1 week)',
      'Learn React Testing Library and write tests for existing project (1 week)',
      'Set up Storybook for component documentation (3 days)',
    ],
  },
  {
    roleId: 'backend',
    roleName: 'Backend Developer',
    matchPercentage: 62,
    missingSkills: ['Node.js', 'PostgreSQL', 'Redis', 'Microservices', 'Docker'],
    roadmap: [
      'Deep dive into Node.js and Express (2 weeks)',
      'Learn PostgreSQL and database design (1 week)',
      'Understand Redis for caching (4 days)',
      'Build a microservices project with Docker (2 weeks)',
    ],
  },
  {
    roleId: 'data',
    roleName: 'Data Analyst',
    matchPercentage: 45,
    missingSkills: ['Python', 'SQL', 'Tableau', 'Statistics', 'Excel Advanced'],
    roadmap: [
      'Learn Python for data analysis (pandas, numpy) (3 weeks)',
      'Master SQL for data querying (2 weeks)',
      'Get Tableau certification (1 week)',
      'Complete statistics fundamentals course (2 weeks)',
    ],
  },
  {
    roleId: 'ai',
    roleName: 'AI Engineer',
    matchPercentage: 35,
    missingSkills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
    roadmap: [
      'Strong Python foundation with focus on ML libraries (4 weeks)',
      'Complete deep learning specialization (6 weeks)',
      'Build NLP project (sentiment analysis) (2 weeks)',
      'Learn MLOps and model deployment (2 weeks)',
    ],
  },
  {
    roleId: 'design',
    roleName: 'Product Designer',
    matchPercentage: 28,
    missingSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    roadmap: [
      'Master Figma for UI/UX design (3 weeks)',
      'Learn user research methodologies (2 weeks)',
      'Build a design portfolio with 3-5 case studies (4 weeks)',
      'Study design systems (Material, Ant Design) (1 week)',
    ],
  },
];

const generateImprovements = () => ({
  improvements: [
    {
      original: 'Worked on frontend development tasks',
      improved: 'Spearheaded frontend development for 5+ client projects, implementing responsive React components that improved user engagement by 35% and reduced bounce rates by 20%',
      type: 'bullet' as const,
    },
    {
      original: 'Fixed bugs and improved performance',
      improved: 'Engineered performance optimizations that reduced page load time by 60% (from 5s to 2s), directly contributing to a 25% increase in user retention',
      type: 'bullet' as const,
    },
    {
      original: 'Collaborated with team members',
      improved: 'Orchestrated cross-functional collaboration between 3 engineering teams and product stakeholders, accelerating feature delivery by 40% through improved Agile workflows',
      type: 'bullet' as const,
    },
    {
      original: 'Developed new features',
      improved: 'Architected and launched 12 customer-facing features using React and Node.js, generating $500K+ in new ARR within 6 months of deployment',
      type: 'bullet' as const,
    },
  ],
  suggestedTitle: 'Senior Full-Stack Developer | React & Node.js | 5+ Years Building Scalable Web Applications',
  projectIdeas: [
    'Build a real-time collaborative document editor using WebSockets and React - demonstrates advanced frontend skills',
    'Create an AI-powered resume analyzer (meta!) using OpenAI API - shows ML integration capability',
    'Develop a microservices-based e-commerce platform with Docker - proves backend and DevOps skills',
    'Build a data visualization dashboard with D3.js and real-time updates - combines frontend and data skills',
    'Create a mobile-first progressive web app (PWA) with offline support - demonstrates modern web development',
  ],
});

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [improvements, setImprovements] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleResumeUpload = async (content: string, fileName?: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeResume(content);
      setAnalysisResult(result);
      setJobMatches(generateJobMatches());
      setImprovements(generateImprovements());
      setActiveTab('overview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRoleSelect = (roleId: string) => {
    console.log('Selected role:', roleId);
  };

  if (!isAuthenticated) return null;

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
