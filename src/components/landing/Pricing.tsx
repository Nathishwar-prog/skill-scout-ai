import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    priceUSD: '$0',
    period: 'forever',
    description: 'Perfect for trying out SkillSync AI',
    features: [
      '1 Resume Analysis',
      'Basic ATS Score',
      'Top 3 Improvement Tips',
      'Email Support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹299',
    priceUSD: '$9',
    period: '/month',
    description: 'For serious job seekers',
    features: [
      'Unlimited Resume Scans',
      'Detailed ATS Analysis',
      'Job Match Analysis',
      'Resume Rewrite Suggestions',
      'Skill Gap Detection',
      'Priority Support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹999',
    priceUSD: '$29',
    period: '/month',
    description: 'Complete career toolkit',
    features: [
      'Everything in Pro',
      'Full AI Resume Rewrite',
      'Job-Specific Versions',
      'Interview Prep Tips',
      'ATS Keyword Optimization',
      'Learning Roadmap',
      '1-on-1 Support',
    ],
    cta: 'Go Premium',
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple,{' '}
            <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your job search journey. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-border/50'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="gradient-primary px-4 py-1 rounded-full text-primary-foreground text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.priceUSD}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  className={`w-full ${plan.popular ? 'gradient-primary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
