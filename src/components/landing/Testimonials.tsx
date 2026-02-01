import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    image: 'PS',
    content: 'SkillSync AI helped me identify crucial keywords I was missing. Got 3x more interview calls after optimizing my resume!',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Data Analyst at Microsoft',
    image: 'RV',
    content: 'As a fresher, I had no idea what recruiters look for. The AI suggestions were spot-on and helped me land my dream job.',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'Product Manager at Amazon',
    image: 'SP',
    content: 'The job matching feature is incredible. It showed me exactly what skills I needed to develop for my target role.',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by{' '}
            <span className="gradient-text">Job Seekers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've improved their career prospects with SkillSync AI.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
