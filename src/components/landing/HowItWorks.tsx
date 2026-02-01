import { Upload, Cpu, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Resume',
    description: 'Upload your PDF/DOCX resume or paste the text directly. Our system handles multiple formats.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Analysis',
    description: 'Our AI scans your resume like a recruiter, checking ATS compatibility, skills, and formatting.',
  },
  {
    icon: CheckCircle,
    step: '03',
    title: 'Get Results & Improve',
    description: 'Receive detailed scores, job matches, and AI-powered suggestions to improve your resume.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How{' '}
            <span className="gradient-text">SkillSync AI</span>
            {' '}Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get your resume analyzed in under 30 seconds with our streamlined process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />

          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 relative z-10">
                <step.icon className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-background px-2 text-sm font-bold text-primary">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
