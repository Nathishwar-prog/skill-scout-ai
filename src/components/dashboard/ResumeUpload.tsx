import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, AlertCircle, Briefcase } from 'lucide-react';

interface ResumeUploadProps {
  onUpload: (resumeText: string, jobDescription: string, fileName?: string) => void;
  isLoading: boolean;
}

const ResumeUpload = ({ onUpload, isLoading }: ResumeUploadProps) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ content: string; name: string } | null>(null);

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
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileContent = content || 'Sample resume content from file: ' + file.name;
      
      // Store file content, will submit when JD is present
      setPendingFile({ content: fileContent, name: file.name });
      
      // If JD is already filled, trigger analysis
      if (jobDescription.trim()) {
        onUpload(fileContent, jobDescription, file.name);
        setPendingFile(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (resumeText.trim()) {
      const jd = jobDescription.trim() || 'General Position / Software Engineer. Evaluate general strengths and weaknesses.';
      onUpload(resumeText, jd, 'pasted-resume.txt');
    }
  };

  const handleFileSubmit = () => {
    if (pendingFile) {
      const jd = jobDescription.trim() || 'General Position / Software Engineer. Evaluate general strengths and weaknesses.';
      onUpload(pendingFile.content, jd, pendingFile.name);
      setPendingFile(null);
    }
  };

  // Changed to allow analysis without JD for general resume feedback
  const canAnalyzeText = resumeText.trim();
  const canAnalyzeFile = pendingFile !== null;

  return (
    <div className="space-y-6">
      {/* Job Description Section - Always visible */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="job-description" className="text-base font-semibold">
                Job Description
              </Label>
              <p className="text-sm text-muted-foreground">
                Optional: Add for ATS score & match analysis
              </p>
            </div>
          </div>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with:
• 5+ years of experience in React/TypeScript
• Experience with cloud services (AWS/GCP)
• Strong problem-solving skills
• Experience leading technical projects..."
            className="min-h-[200px] resize-none"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          {!jobDescription.trim() && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Please paste the job description to enable analysis</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Upload Section */}
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
                  dragActive ? 'border-primary bg-primary/5' : 
                  pendingFile ? 'border-success bg-success/5' :
                  'border-border hover:border-primary/50'
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
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    pendingFile ? 'bg-success/20' : 'gradient-primary'
                  }`}>
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
                    ) : pendingFile ? (
                      <FileText className="h-8 w-8 text-success" />
                    ) : (
                      <Upload className="h-8 w-8 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    {pendingFile ? (
                      <>
                        <p className="text-lg font-medium mb-1 text-success">
                          {pendingFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Resume uploaded. Click Analyze to start.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-medium mb-1">
                          {isLoading ? 'Analyzing...' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports PDF, DOCX, DOC, TXT
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <label htmlFor="resume-upload">
                      <Button variant="outline" className="cursor-pointer" disabled={isLoading} asChild>
                        <span>
                          <FileText className="mr-2 h-4 w-4" />
                          {pendingFile ? 'Change File' : 'Browse Files'}
                        </span>
                      </Button>
                    </label>
                    {pendingFile && (
                      <Button 
                        className="gradient-primary" 
                        onClick={handleFileSubmit}
                        disabled={!canAnalyzeFile || isLoading}
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
                    )}
                  </div>
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
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <Button 
                  className="w-full gradient-primary" 
                  onClick={handleTextSubmit}
                  disabled={!canAnalyzeText || isLoading}
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
                {!canAnalyzeText && (resumeText.trim() || jobDescription.trim()) && (
                  <p className="text-sm text-muted-foreground text-center">
                    {!jobDescription.trim() ? 'Add job description above' : 'Add resume text'} to enable analysis
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUpload;
