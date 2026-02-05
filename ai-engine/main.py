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

class RankRequest(BaseModel):
    query: str
    candidates: list[str]
    top_k: int = 5

class RankResponse(BaseModel):
    ranked_results: list[dict] # [{"index": int, "score": float, "text": str}]

@app.post("/rank", response_model=RankResponse)
async def rank_candidates(request: RankRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        query_embedding = model.encode(request.query, convert_to_tensor=True)
        candidate_embeddings = model.encode(request.candidates, convert_to_tensor=True)

        # Compute cosine similarity
        cosine_scores = util.cos_sim(query_embedding, candidate_embeddings)[0]

        # Use torch.topk for efficient ranking
        top_results = []
        # If fewer candidates than top_k, take all
        k = min(request.top_k, len(request.candidates))
        
        # Sort manually to avoid heavy torch dependency if not needed, but torch is already there
        # Convert to list for easy handling
        scores_list = cosine_scores.tolist()
        
        # Create (score, index) pairs
        indexed_scores = [(score, i) for i, score in enumerate(scores_list)]
        # Sort descending
        indexed_scores.sort(key=lambda x: x[0], reverse=True)
        
        # Take top k
        top_k_indices = indexed_scores[:k]
        
        results = []
        for score, idx in top_k_indices:
            results.append({
                "index": idx,
                "score": float(score),
                "text": request.candidates[idx]
            })
            
        return RankResponse(ranked_results=results)

    except Exception as e:
        logger.error(f"Error computing rank: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
