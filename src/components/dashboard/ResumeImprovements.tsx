import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Download, 
  Sparkles, 
  RefreshCw,
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Improvement {
  original: string;
  improved: string;
  type: 'bullet' | 'summary' | 'title';
}

interface ResumeImprovementsProps {
  improvements: Improvement[];
  suggestedTitle: string;
  projectIdeas: string[];
  onBuildResume?: () => void;
  isBuilding?: boolean;
}

const ResumeImprovements = ({ 
  improvements, 
  suggestedTitle, 
  projectIdeas, 
  onBuildResume, 
  isBuilding 
}: ResumeImprovementsProps) => {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    const content = improvements.map(i => 
      `Original: ${i.original}\nImproved: ${i.improved}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-improvements.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Build Resume CTA */}
      {onBuildResume && (
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Ready to create your improved resume?</p>
              <p className="text-sm text-muted-foreground">
                Generate a polished resume with all improvements applied automatically
              </p>
            </div>
            <Button 
              onClick={onBuildResume} 
              disabled={isBuilding}
              className="gradient-primary"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Build Improved Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Suggested Title */}
      <Card className="border-border/50 border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Suggested Resume Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
            <p className="font-semibold text-lg">{suggestedTitle}</p>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => handleCopy(suggestedTitle, -1)}
            >
              {copiedIndex === -1 ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bullet Point Improvements */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI-Improved Bullet Points (STAR Method)</CardTitle>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {improvements.filter(i => i.type === 'bullet').map((improvement, index) => (
            <div key={index} className="space-y-2 p-4 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Original:</p>
                <p className="text-sm line-through text-muted-foreground">{improvement.original}</p>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-success mb-1 flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Improved:
                  </p>
                  <p className="text-sm font-medium">{improvement.improved}</p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handleCopy(improvement.improved, index)}
                >
                  {copiedIndex === index ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Project Ideas */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Suggested Projects to Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectIdeas.map((idea, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <p className="text-sm">{idea}</p>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="ml-auto flex-shrink-0"
                  onClick={() => handleCopy(idea, 100 + index)}
                >
                  {copiedIndex === 100 + index ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Verbs */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Strong Action Verbs to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Spearheaded', 'Architected', 'Engineered', 'Optimized', 'Automated',
              'Streamlined', 'Pioneered', 'Orchestrated', 'Transformed', 'Accelerated',
              'Championed', 'Devised', 'Implemented', 'Launched', 'Mentored'
            ].map((verb, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary hover:border-primary"
                onClick={() => handleCopy(verb, 200 + index)}
              >
                {copiedIndex === 200 + index ? <CheckCircle className="mr-1 h-3 w-3 text-success" /> : null}
                {verb}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeImprovements;
