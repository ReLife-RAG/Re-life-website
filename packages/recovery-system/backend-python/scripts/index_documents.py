"""
Document Indexing Script - Load PDFs into Pinecone
This script reads PDF files from data/documents and indexes them into Pinecone
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.rag_service import rag_service

# Load environment variables
load_dotenv()

def main():
    documents_dir = "./data/documents"
    
    # Check if documents directory exists
    if not os.path.exists(documents_dir):
        print(f"❌ Documents directory not found: {documents_dir}")
        print(f"📁 Creating directory...")
        os.makedirs(documents_dir, exist_ok=True)
        print(f"   Please add PDF files to: {os.path.abspath(documents_dir)}")
        return
    
    # Check if there are PDFs in the directory
    pdf_files = list(Path(documents_dir).glob("*.pdf"))
    
    if not pdf_files:
        print(f"❌ No PDF files found in {documents_dir}")
        print(f"📝 Please add PDF files to this directory")
        return
    
    print(f"📚 Found {len(pdf_files)} PDF file(s):")
    for pdf in pdf_files:
        print(f"   - {pdf.name}")
    
    print(f"\n⏳ Indexing documents into Pinecone...")
    try:
        num_chunks = rag_service.load_and_index_documents(documents_dir)
        print(f"✅ Successfully indexed {num_chunks} document chunks into Pinecone!")
        print(f"\n🎉 Your RAG system is now ready to use!")
    except Exception as e:
        print(f"❌ Error indexing documents: {str(e)}")
        print(f"\nMake sure:")
        print(f"  1. PINECONE_API_KEY is set in .env")
        print(f"  2. PINECONE_INDEX_NAME is correct in .env")
        print(f"  3. Your Pinecone index 'recovery-system-rag' is created")
        sys.exit(1)

if __name__ == "__main__":
    main()
