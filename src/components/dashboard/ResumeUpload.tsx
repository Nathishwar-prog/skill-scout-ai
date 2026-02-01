import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  onUpload: (content: string, fileName?: string) => void;
  isLoading: boolean;
}

const ResumeUpload = ({ onUpload, isLoading }: ResumeUploadProps) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // For demo purposes, we'll read as text
    // In production, you'd parse PDF/DOCX properly
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onUpload(content || 'Sample resume content from file: ' + file.name, file.name);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (text.trim()) {
      onUpload(text, 'pasted-resume.txt');
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">
                    {isLoading ? 'Analyzing...' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, DOC, TXT
                  </p>
                </div>
                <label htmlFor="resume-upload">
                  <Button variant="outline" className="cursor-pointer" disabled={isLoading} asChild>
                    <span>
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paste">
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your resume text here...

Example:
John Doe
Software Engineer

Experience:
- Senior Developer at Tech Corp (2020-Present)
  • Led development of microservices architecture
  • Reduced deployment time by 60%

Skills: React, Node.js, Python, AWS"
                className="min-h-[300px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button 
                className="w-full gradient-primary" 
                onClick={handleTextSubmit}
                disabled={!text.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
