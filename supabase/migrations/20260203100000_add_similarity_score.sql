-- Add similarity columns to analysis_history
ALTER TABLE public.analysis_history 
ADD COLUMN IF NOT EXISTS similarity_score FLOAT,
ADD COLUMN IF NOT EXISTS similarity_version TEXT;

-- Create index for similarity score queries if needed later
CREATE INDEX IF NOT EXISTS idx_analysis_history_similarity_score ON public.analysis_history(similarity_score);
