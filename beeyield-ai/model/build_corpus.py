import os
import json
import glob
from pathlib import Path

def clean_text(text):
    """Basic text cleaning."""
    # Remove excessive newlines
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return text

def build_corpus(base_dir: str, output_file: str):
    """Aggregate all data sources into a single corpus file."""
    print(f"Building corpus from {base_dir}...")
    base_path = Path(base_dir)
    
    documents = []
    
    # 1. Internal Knowledge Base
    kb_path = base_path / "backend" / "app" / "data" / "knowledge_base.json"
    if kb_path.exists():
        with open(kb_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Extract nodes
            nodes = data.get("knowledge_nodes", [])
            for node in nodes:
                content = node.get("content", "")
                if content:
                    documents.append(f"Subject: {node.get('subtopic', 'Company Data')}\n{content}")
            
            # Extract dedicated fields
            mission = data.get("dna", {}).get("mission", "")
            if mission:
                documents.append(f"Mission: {mission}")

    # 2. Bee Encyclopedia
    enc_path = base_path / "backend" / "app" / "data" / "bee_encyclopedia.json"
    if enc_path.exists():
        with open(enc_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Handle dictionary of species/diseases
            for category in ["bee_species", "diseases_and_pests", "precision_pollination"]:
                items = data.get(category, {})
                for name, details in items.items():
                    text = f"Title: {name}\n"
                    if isinstance(details, dict):
                        for k, v in details.items():
                            text += f"{k.replace('_', ' ').title()}: {v}\n"
                    else:
                        text += str(details)
                    documents.append(text)

    # 3. Scraped Company Data (Markdown)
    company_data_dir = base_path / "beeyield-ai" / "data" / "company"
    if company_data_dir.exists():
        for md_file in company_data_dir.glob("**/*.md"):
            with open(md_file, 'r', encoding='utf-8') as f:
                documents.append(f.read())
                
    # 4. Raw/Processed External Data
    # Add logic here if you have external scraped data
    
    print(f"Collected {len(documents)} documents.")
    
    # Write to corpus file with separators
    with open(output_file, 'w', encoding='utf-8') as f:
        for doc in documents:
            clean_doc = clean_text(doc)
            if len(clean_doc) > 50:  # Skip tiny fragments
                f.write("<|doc|>\n")
                f.write(clean_doc)
                f.write("\n<|endofdoc|>\n")
    
    print(f"Corpus saved to {output_file}")
    print(f"Total size: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python build_corpus.py <project_root> <output_file>")
        print("Example: python build_corpus.py ../.. data/corpus.txt")
        sys.exit(1)
        
    build_corpus(sys.argv[1], sys.argv[2])
