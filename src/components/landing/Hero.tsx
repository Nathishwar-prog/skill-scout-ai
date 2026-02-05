import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, Target, TrendingUp } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 overflow-hidden">
      <div className="container mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI-Powered Resume Analysis and Rewriting</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          Get Your Resume{' '}
          <span className="gradient-text">Job-Ready</span>
          <br />
          with AI
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
          ATS Score • Skill Gap Analysis • Job Match • AI-Powered Suggestions
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
          <Button size="lg" asChild className="gradient-primary text-lg px-8 py-6 animate-pulse-glow">
            <Link to="/signup">
              <Upload className="mr-2 h-5 w-5" />
              Upload Resume
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
            <Link to="/signup">Try Free</Link>
          </Button>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in">
          {[
            { icon: Target, value: '95%', label: 'ATS Accuracy' },
            // { icon: TrendingUp, value: '50K+', label: 'Resumes Analyzed' },
            { icon: Sparkles, value: '85%', label: 'Success Rate' },
            { icon: Upload, value: '10s', label: 'Analysis Time' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div> */}
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default Hero;
