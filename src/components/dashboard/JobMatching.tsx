import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Code, 
  Database, 
  BarChart3, 
  Brain, 
  Palette, 
  Plus,
  ChevronRight
} from 'lucide-react';

const defaultRoles = [
  { id: 'frontend', name: 'Frontend Developer', icon: Code, color: 'bg-blue-500' },
  { id: 'backend', name: 'Backend Developer', icon: Database, color: 'bg-green-500' },
  { id: 'data', name: 'Data Analyst', icon: BarChart3, color: 'bg-purple-500' },
  { id: 'ai', name: 'AI Engineer', icon: Brain, color: 'bg-pink-500' },
  { id: 'design', name: 'Product Designer', icon: Palette, color: 'bg-orange-500' },
];

interface JobMatch {
  roleId: string;
  roleName: string;
  matchPercentage: number;
  missingSkills: string[];
  roadmap: string[];
}

interface JobMatchingProps {
  onSelectRole: (roleId: string) => void;
  jobMatches: JobMatch[];
}

const JobMatching = ({ onSelectRole, jobMatches }: JobMatchingProps) => {
  const [customRole, setCustomRole] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    onSelectRole(roleId);
  };

  const handleCustomRole = () => {
    if (customRole.trim()) {
      handleRoleSelect(customRole);
      setCustomRole('');
    }
  };

  const selectedMatch = jobMatches.find(m => m.roleId === selectedRole);

  return (
    <div className="space-y-6">
      {/* Role Selection */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Select Target Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {defaultRoles.map((role) => {
              const match = jobMatches.find(m => m.roleId === role.id);
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                    selectedRole === role.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className={`w-10 h-10 ${role.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                    <role.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-medium">{role.name}</p>
                  {match && (
                    <p className={`text-xs mt-1 ${
                      match.matchPercentage >= 70 ? 'text-success' : 
                      match.matchPercentage >= 50 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {match.matchPercentage}% Match
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Role Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom role (e.g., DevOps Engineer)"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomRole()}
            />
            <Button onClick={handleCustomRole} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Match Results */}
      {selectedMatch && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Match Score */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Match Score</span>
                <span className={`text-3xl ${
                  selectedMatch.matchPercentage >= 70 ? 'text-success' :
                  selectedMatch.matchPercentage >= 50 ? 'text-warning' : 'text-destructive'
                }`}>
                  {selectedMatch.matchPercentage}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={selectedMatch.matchPercentage} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground">
                {selectedMatch.matchPercentage >= 70 
                  ? 'Great match! Your resume is well-aligned with this role.'
                  : selectedMatch.matchPercentage >= 50
                  ? 'Good potential. Some improvements needed to be competitive.'
                  : 'Significant skill gaps exist. Focus on the roadmap below.'}
              </p>
            </CardContent>
          </Card>

          {/* Missing Skills */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Missing Skills for {selectedMatch.roleName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.missingSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-destructive/5 border-destructive/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Roadmap */}
          <Card className="border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle>Suggested Learning Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedMatch.roadmap.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm">{step}</p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobMatching;
