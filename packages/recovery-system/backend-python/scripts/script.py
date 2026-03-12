import os
from dotenv import load_dotenv
from pinecone import Pinecone

# Load environment variables
load_dotenv()

api_key = os.getenv("PINECONE_API_KEY")
if not api_key:
    raise ValueError("PINECONE_API_KEY not found in .env file")

pc = Pinecone(api_key=api_key)

pc.create_index(
    name="recovery-system-rag",
    dimension=384,  # For all-MiniLM-L6-v2 embeddings
    metric="cosine",
    spec={
        "serverless": {
            "cloud": "aws",
            "region": "us-east-1"
        }
    }
)

print("✅ Pinecone index created successfully!")