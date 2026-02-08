"""
Document Ingestion Pipeline
============================
Ingest company data and research documents into the vector store.
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Generator
from dataclasses import dataclass

from .vector_store import get_vector_store
from .embeddings import get_embedding_model


@dataclass
class Document:
    """A document to be ingested."""
    id: str
    content: str
    metadata: Dict[str, Any]


class DocumentIngester:
    """
    Ingests documents from various sources into the vector store.
    
    Handles:
    - JSON knowledge bases
    - Markdown files
    - Scraped web content
    - Company SOPs
    """
    
    CHUNK_SIZE = 512  # Characters per chunk
    CHUNK_OVERLAP = 50
    
    def __init__(self):
        self.vector_store = get_vector_store()
        self.embedding_model = get_embedding_model()
    
    def chunk_text(self, text: str) -> Generator[str, None, None]:
        """Split text into overlapping chunks."""
        if len(text) <= self.CHUNK_SIZE:
            yield text
            return
        
        start = 0
        while start < len(text):
            end = start + self.CHUNK_SIZE
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for period, question mark, or newline
                for sep in ['. ', '? ', '! ', '\n']:
                    break_point = text.rfind(sep, start, end)
                    if break_point > start:
                        end = break_point + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                yield chunk
            
            # Ensure we always move forward
            new_start = end - self.CHUNK_OVERLAP
            if new_start <= start:
                start = end
            else:
                start = new_start
    
    def ingest_json_kb(
        self,
        filepath: str,
        source_name: str,
        is_company: bool = True,
    ) -> int:
        """Ingest a JSON knowledge base file."""
        path = Path(filepath)
        if not path.exists():
            print(f"File not found: {filepath}")
            return 0
        
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        documents = []
        
        # Handle different JSON structures
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            # Try common keys
            items = (
                data.get("nodes") or 
                data.get("items") or 
                data.get("entries") or
                data.get("data") or
                [data]
            )
        else:
            items = [data]
        
        for item in items:
            if isinstance(item, dict):
                # Extract content from various possible keys
                content = (
                    item.get("content") or
                    item.get("text") or
                    item.get("description") or
                    item.get("body") or
                    str(item)
                )
                
                title = item.get("title") or item.get("name") or item.get("id") or ""
                
                # Create document with title prefix
                full_content = f"{title}\n\n{content}" if title else content
                
                doc_id = hashlib.md5(full_content.encode()).hexdigest()[:16]
                
                # Chunk the content
                for i, chunk in enumerate(self.chunk_text(full_content)):
                    documents.append(Document(
                        id=f"{doc_id}_{i}",
                        content=chunk,
                        metadata={
                            "source": source_name,
                            "source_type": "company" if is_company else "research",
                            "is_company": is_company,
                            "verified": True,
                            "title": title[:100] if title else None,
                            "date": datetime.now().isoformat(),
                            "keywords": item.get("keywords", []),
                        }
                    ))
        
        # Embed and store
        if documents:
            print(f"Embedding and storing {len(documents)} chunks from {source_name}...")
            self._store_documents(documents)
            print(f"Successfully stored {len(documents)} chunks.")
        
        print(f"Ingested {len(documents)} chunks from {source_name}")
        return len(documents)
    
    def ingest_markdown(
        self,
        filepath: str,
        source_name: str,
        source_type: str = "company",
        url: Optional[str] = None,
    ) -> int:
        """Ingest a markdown file."""
        path = Path(filepath)
        if not path.exists():
            print(f"File not found: {filepath}")
            return 0
        
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        doc_id = hashlib.md5(content.encode()).hexdigest()[:16]
        documents = []
        
        for i, chunk in enumerate(self.chunk_text(content)):
            documents.append(Document(
                id=f"{doc_id}_{i}",
                content=chunk,
                metadata={
                    "source": source_name,
                    "source_type": source_type,
                    "is_company": source_type == "company",
                    "verified": True,
                    "url": url,
                    "filename": path.name,
                    "date": datetime.now().isoformat(),
                }
            ))
        
        if documents:
            self._store_documents(documents)
        
        print(f"Ingested {len(documents)} chunks from {path.name}")
        return len(documents)
    
    def ingest_scraped_content(
        self,
        content: str,
        source_id: str,
        source_name: str,
        url: str,
        source_type: str = "research",
        verified: bool = True,
    ) -> int:
        """Ingest scraped web content."""
        doc_id = hashlib.md5(f"{source_id}_{url}".encode()).hexdigest()[:16]
        documents = []
        
        for i, chunk in enumerate(self.chunk_text(content)):
            documents.append(Document(
                id=f"{doc_id}_{i}",
                content=chunk,
                metadata={
                    "source": source_name,
                    "source_id": source_id,
                    "source_type": source_type,
                    "is_company": False,
                    "verified": verified,
                    "url": url,
                    "date": datetime.now().isoformat(),
                }
            ))
        
        if documents:
            self._store_documents(documents)
        
        return len(documents)
    
    def _store_documents(self, documents: List[Document], batch_size: int = 50):
        """Embed and store documents in batches."""
        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            print(f"  Processing batch {i//batch_size + 1}/{(len(documents)-1)//batch_size + 1} ({len(batch)} documents)...")
            
            contents = [doc.content for doc in batch]
            embeddings = self.embedding_model.embed_documents(contents)
            
            self.vector_store.add_documents(
                ids=[doc.id for doc in batch],
                embeddings=embeddings,
                contents=contents,
                metadatas=[doc.metadata for doc in batch],
            )
            print(f"  Batch {i//batch_size + 1} stored.")
        print("All documents stored.")
    
    def ingest_company_data(self, base_path: str) -> Dict[str, int]:
        """Ingest all company data from the project."""
        results = {}
        base = Path(base_path)
        
        # Knowledge base
        kb_path = base / "backend" / "app" / "data" / "knowledge_base.json"
        if kb_path.exists():
            results["knowledge_base"] = self.ingest_json_kb(
                str(kb_path), "BeeYield Knowledge Base", is_company=True
            )
        
        # Encyclopedia
        enc_path = base / "backend" / "app" / "data" / "bee_encyclopedia.json"
        if enc_path.exists():
            results["bee_encyclopedia"] = self.ingest_json_kb(
                str(enc_path), "BeeYield Encyclopedia", is_company=True
            )
        
        return results


if __name__ == "__main__":
    # Test ingestion
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ingestion.py <project_base_path>")
        sys.exit(1)
    
    ingester = DocumentIngester()
    results = ingester.ingest_company_data(sys.argv[1])
    
    print("\nIngestion Results:")
    for source, count in results.items():
        print(f"  {source}: {count} chunks")
    
    # Print stats
    stats = ingester.vector_store.get_stats()
    print(f"\nVector Store Stats: {stats}")
