import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  History, 
  FileText, 
  Target, 
  Trash2, 
  ChevronRight,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalysisRecord {
  id: string;
  resume_text: string;
  job_description: string;
  analysis_results: any;
  created_at: string;
}

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: AnalysisRecord) => void;
}

const AnalysisHistory = ({ onSelectAnalysis }: AnalysisHistoryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error fetching analyses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analysis history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from('analysis_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Deleted',
        description: 'Analysis removed from history'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete analysis',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Strong Match': return 'bg-green-500/10 text-green-500';
      case 'Good Match': return 'bg-emerald-500/10 text-emerald-500';
      case 'Moderate Match': return 'bg-yellow-500/10 text-yellow-500';
      case 'Weak Match': return 'bg-orange-500/10 text-orange-500';
      case 'Poor Match': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <History className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Analysis History</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your resume-JD analyses will appear here once you start analyzing. Go to "Resume + JD" to begin!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
          <Badge variant="secondary" className="ml-2">{analyses.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <Card 
                key={analysis.id}
                className="border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => onSelectAnalysis(analysis)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getVerdictColor(analysis.analysis_results?.overallVerdict)}>
                          {analysis.analysis_results?.overallVerdict || 'N/A'}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(analysis.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{analysis.analysis_results?.atsScore || 0}</p>
                          <p className="text-xs text-muted-foreground">ATS</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{analysis.analysis_results?.jobMatchPercentage || 0}%</p>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{analysis.analysis_results?.skillMatchPercentage || 0}%</p>
                          <p className="text-xs text-muted-foreground">Skills</p>
                        </div>
                        <div className="text-center p-2 rounded bg-muted/50">
                          <p className="text-lg font-bold">{analysis.analysis_results?.similarityScore || 0}%</p>
                          <p className="text-xs text-muted-foreground">Similar</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {truncateText(analysis.job_description, 40)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(analysis.id, e)}
                        disabled={deletingId === analysis.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AnalysisHistory;
