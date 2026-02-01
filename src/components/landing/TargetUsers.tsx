import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Briefcase, RefreshCw } from 'lucide-react';

const users = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Build your first professional resume with AI guidance and stand out from peers.',
    features: ['Campus placement ready', 'Project highlighting', 'Skills optimization'],
  },
  {
    icon: Briefcase,
    title: 'Freshers',
    description: 'Transition from college to career with a resume that showcases your potential.',
    features: ['Entry-level optimization', 'Internship showcasing', 'Certifications'],
  },
  {
    icon: RefreshCw,
    title: 'Job Switchers',
    description: 'Rebrand yourself for new opportunities with targeted resume improvements.',
    features: ['Role transition tips', 'Experience reframing', 'Industry keywords'],
  },
];

const TargetUsers = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for{' '}
            <span className="gradient-text">Every Career Stage</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're starting out or making a career move, SkillSync AI adapts to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {users.map((user, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <user.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{user.title}</h3>
                <p className="text-muted-foreground mb-6">{user.description}</p>
                <ul className="space-y-2">
                  {user.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetUsers;
