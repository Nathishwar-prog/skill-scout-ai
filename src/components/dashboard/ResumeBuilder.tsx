import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  Download, 
  FileText,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResumeSections {
  header: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
}

interface ResumeBuilderProps {
  improvedResume: string;
  sections: ResumeSections;
  onClose: () => void;
}

const ResumeBuilder = ({ improvedResume, sections: initialSections, onClose }: ResumeBuilderProps) => {
  const { toast } = useToast();
  const [sections, setSections] = useState<ResumeSections>(initialSections);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sectionLabels: Record<keyof ResumeSections, string> = {
    header: 'Header & Contact',
    summary: 'Professional Summary',
    experience: 'Work Experience',
    skills: 'Skills',
    education: 'Education'
  };

  const handleCopyAll = async () => {
    const fullResume = Object.values(sections).join('\n\n---\n\n');
    await navigator.clipboard.writeText(fullResume);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Full resume copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySection = async (sectionKey: keyof ResumeSections) => {
    await navigator.clipboard.writeText(sections[sectionKey]);
    toast({ title: 'Copied!', description: `${sectionLabels[sectionKey]} copied to clipboard.` });
  };

  const handleDownload = () => {
    const fullResume = Object.entries(sections)
      .map(([key, value]) => `=== ${sectionLabels[key as keyof ResumeSections].toUpperCase()} ===\n\n${value}`)
      .join('\n\n\n');
    
    const blob = new Blob([fullResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'improved-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Resume saved as improved-resume.txt' });
  };

  const handleSectionChange = (sectionKey: keyof ResumeSections, value: string) => {
    setSections(prev => ({ ...prev, [sectionKey]: value }));
  };

  const toggleExpand = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
    if (editingSection === sectionKey) {
      setEditingSection(null);
    }
  };

  const toggleEdit = (sectionKey: string) => {
    if (editingSection === sectionKey) {
      setEditingSection(null);
    } else {
      setEditingSection(sectionKey);
      setExpandedSection(sectionKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Your Improved Resume
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyAll}>
                {copied ? <CheckCircle className="mr-2 h-4 w-4 text-success" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy All
              </Button>
              <Button size="sm" onClick={handleDownload} className="gradient-primary">
                <Download className="mr-2 h-4 w-4" />
                Download TXT
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your resume has been improved with all AI suggestions applied. Edit any section below, then copy or download when ready.
          </p>
        </CardContent>
      </Card>

      {/* Section Cards */}
      {(Object.keys(sections) as Array<keyof ResumeSections>).map((sectionKey) => (
        <Card key={sectionKey} className="border-border/50">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleExpand(sectionKey)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{sectionLabels[sectionKey]}</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEdit(sectionKey);
                  }}
                >
                  {editingSection === sectionKey ? (
                    <>
                      <Save className="mr-1 h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit3 className="mr-1 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopySection(sectionKey);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {expandedSection === sectionKey ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          
          {expandedSection === sectionKey && (
            <CardContent className="pt-0">
              {editingSection === sectionKey ? (
                <Textarea
                  value={sections[sectionKey]}
                  onChange={(e) => handleSectionChange(sectionKey, e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder={`Enter your ${sectionLabels[sectionKey].toLowerCase()}...`}
                />
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 whitespace-pre-wrap font-mono text-sm">
                  {sections[sectionKey]}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Footer Actions */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Done editing? Download your resume or copy it to paste into a document editor.
          </p>
          <Button variant="outline" onClick={onClose}>
            Back to Improvements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeBuilder;
