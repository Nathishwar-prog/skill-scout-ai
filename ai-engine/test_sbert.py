from sentence_transformers import SentenceTransformer, util
import sys

def test_sbert():
    print("Loading SBERT model: sentence-transformers/all-MiniLM-L6-v2...")
    try:
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', device='cpu')
        print("Model loaded successfully.")
    except Exception as e:
        print(f"FAILED to load model: {e}")
        sys.exit(1)

    resume_text = "Experienced software engineer with strong Python and React skills. 5 years of experience in backend development."
    job_description = "Looking for a Senior Software Engineer with Python and React experience. Must have at least 4 years of experience."

    print("\nEncoding texts...")
    embedding1 = model.encode(resume_text, convert_to_tensor=True)
    embedding2 = model.encode(job_description, convert_to_tensor=True)

    print("Computing cosine similarity...")
    cosine_score = util.cos_sim(embedding1, embedding2)
    raw_score = float(cosine_score[0][0])
    similarity_score = round(raw_score * 100, 2)

    print("-" * 30)
    print(f"Raw Cosine Score: {raw_score:.4f}")
    print(f"Similarity Score: {similarity_score}%")
    print("-" * 30)

    if similarity_score > 50:
        print("VERIFICATION PASSED: Similarity calculation seems reasonable.")
    else:
        print("VERIFICATION WARNING: Similarity score is lower than expected for similar texts.")

if __name__ == "__main__":
    test_sbert()
