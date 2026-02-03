from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Skill Scout AI - Semantic Engine")

# Load model globally on startup
model_name = "sentence-transformers/all-MiniLM-L6-v2"
model = None

@app.on_event("startup")
async def startup_event():
    global model
    logger.info(f"Loading SBERT model: {model_name}...")
    try:
        model = SentenceTransformer(model_name)
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise e

class SimilarityRequest(BaseModel):
    resume_text: str
    job_description: str

class SimilarityResponse(BaseModel):
    similarity_score: float
    raw_cosine_score: float
    model_version: str

@app.post("/similarity", response_model=SimilarityResponse)
async def compute_similarity(request: SimilarityRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    # Input validation / Truncation
    # Truncate to reasonable length to prevent DoS/memory issues (approx 5000 chars ~ 1000-1500 tokens)
    # The model max input length is 256 tokens, but pooling handles longer texts vaguely. 
    # However, for huge texts, it's better to truncate or chunk. 
    # We'll truncate strictly to 10000 chars for safety, though SBERT will truncate to 256 tokens internally usually.
    
    resume_text = request.resume_text[:10000]
    jd_text = request.job_description[:10000]

    try:
        # Encode sentences
        embeddings1 = model.encode(resume_text, convert_to_tensor=True)
        embeddings2 = model.encode(jd_text, convert_to_tensor=True)

        # Compute cosine similarity
        cosine_score = util.cos_sim(embeddings1, embeddings2)
        
        # Extract scalar value
        raw_score = float(cosine_score[0][0])
        
        # Convert to 0-100 scale
        # Cosine similarity is -1 to 1. 
        # For text similarity, it's usually 0 to 1.
        # We clamp negative values to 0 just in case.
        clamped_score = max(0.0, raw_score)
        similarity_score = round(clamped_score * 100, 2)
        
        return SimilarityResponse(
            similarity_score=similarity_score,
            raw_cosine_score=raw_score,
            model_version=model_name
        )

    except Exception as e:
        logger.error(f"Error computing similarity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
