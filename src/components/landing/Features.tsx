import { Card, CardContent } from '@/components/ui/card';
import { 
  FileSearch, 
  Target, 
  Zap, 
  TrendingUp, 
  BrainCircuit, 
  Shield 
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'ATS Score Analysis',
    description: 'Get instant ATS compatibility score and understand how recruiters see your resume.',
  },
  {
    icon: Target,
    title: 'Skill Gap Detection',
    description: 'Identify missing skills for your target roles and get personalized suggestions.',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Insights',
    description: 'Receive intelligent suggestions to strengthen weak sections and highlight achievements.',
  },
  {
    icon: TrendingUp,
    title: 'Job Match Analysis',
    description: 'See how well your resume matches specific job roles with detailed breakdowns.',
  },
  {
    icon: Zap,
    title: 'Instant Rewrites',
    description: 'Get AI-generated bullet points using the STAR method for maximum impact.',
  },
  {
    icon: Shield,
    title: 'Grammar & Clarity',
    description: 'Professional grammar check and clarity optimization for polished results.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Land Your Dream Job</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your resume like a real recruiter, providing actionable insights to improve your chances.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
