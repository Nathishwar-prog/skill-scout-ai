-- Add columns to track which models were used for analysis
ALTER TABLE analysis_history 
ADD COLUMN IF NOT EXISTS similarity_model TEXT DEFAULT 'sentence-transformers/all-MiniLM-L6-v2',
ADD COLUMN IF NOT EXISTS llm_model TEXT DEFAULT 'phi3:latest';

-- Update the comment to reflect usage
COMMENT ON COLUMN analysis_history.similarity_score IS 'Deterministic score from SBERT (0-100)';
COMMENT ON COLUMN analysis_history.similarity_model IS 'The SBERT model used for the score';
COMMENT ON COLUMN analysis_history.llm_model IS 'The Local LLM used for text generation';
