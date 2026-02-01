-- Create analysis_history table
CREATE TABLE public.analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  resume_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  analysis_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster user queries
CREATE INDEX idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX idx_analysis_history_created_at ON public.analysis_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view their own analyses"
ON public.analysis_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own analyses
CREATE POLICY "Users can create their own analyses"
ON public.analysis_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses"
ON public.analysis_history
FOR DELETE
USING (auth.uid() = user_id);