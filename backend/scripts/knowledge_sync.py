import os
import re
import json
import time
import asyncio
from typing import Dict, List, Any
import httpx
from dotenv import load_dotenv

# Load environment
load_dotenv("../.env")

# Source directories relative to this script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
SOURCE_DIRS = [
    os.path.join(BASE_DIR, "src/pages"),
    os.path.join(BASE_DIR, "src/components")
]

KNOWLEDGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../app/data/knowledge_base.json"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

BEE_DNA_HARDCODED = {
    "company": "BeeYield",
    "mission": "Revolutionizing African beekeeping through precision IoT and blockchain traceability.",
    "hq": {
        "location": "Kibwezi, Makueni County, Kenya",
        "farm_size": "5-acre secure apiary site",
        "hives_count": 184
    },
    "founders": [
        {"name": "Timothy Mathuva", "role": "CEO", "background": "Strathmore University, Visionary leader"},
        {"name": "Agatha Mathuva", "role": "IT & Blockchain Head", "background": "Strathmore University, Tech Architect"},
        {"name": "Carole Mathuva", "role": "Chief Growth Officer", "background": "Strathmore University, Scaling expert"}
    ],
    "tech_stack": {
        "sensors": "Acoustic (Buzz Analysis), Thermal (Brood Temp), Load Cells (Weight/Nectar), LoRaWAN Connectivity",
        "blockchain": "HoneyChain - Immutable traceability from flower to jar",
        "ml": "Proprietary algorithms for disease detection (AFB, Hive Health anomalies)"
    }
}

def clean_jsx_text(text: str) -> str:
    """Extraction engine: Grabs ONLY semantic text from React files."""
    # 1. Remove obvious code blocks (imports, types, styles)
    text = re.sub(r'import\s+.*?;', '', text, flags=re.S)
    text = re.sub(r'interface\s+.*?\{.*?\}', '', text, flags=re.S)
    text = re.sub(r'const\s+\w+:\s+React\.FC.*?=', '', text, flags=re.S)
    
    # 2. Extract content from between JSX tags: <tag>TEXT</tag>
    # We ignore strings that look like pure JS (e.g. {loading ? '...' : '...'})
    text_nodes = re.findall(r'>([^<>{}"\']+)<', text)
    
    # 3. Extract meaningful properties like labels and titles
    props = re.findall(r'(?:title|label|description|placeholder|heading|quote|bio|mission|motto)\s*=\s*["\'`]([^"\'`]{4,})["\'`]', text)
    
    # 4. Extract long static strings in the code
    long_strings = re.findall(r'["\'`]([^"\'`]{30,})["\'`]', text)
    
    # Combine and Filter: Remove strings that are just CSS classes or short words
    candidates = text_nodes + props + long_strings
    filtered = []
    for c in candidates:
        c = c.strip()
        # Quality Filter: Must contain letters, no weird JS symbols, at least 1 space for sentences OR meaningful titles
        if len(c) > 5 and re.search(r'[a-zA-Z]', c) and not re.search(r'[\{\}\[\]\(\)=>:;]', c):
            filtered.append(c)
    
    combined = ". ".join(filtered)
    combined = re.sub(r'\s+', ' ', combined).strip()
    return combined

def extract_structured_chunks(content: str, source_name: str) -> List[Dict[str, Any]]:
    chunks = []
    raw_text = clean_jsx_text(content)
    
    if len(raw_text) < 30:
        return []

    # One node if small
    if len(raw_text) < 1200:
        chunks.append({
            "source": source_name,
            "subtopic": "Key Facts",
            "content": raw_text
        })
    else:
        # Split into semantic chunks
        sentences = raw_text.split(". ")
        current_chunk = ""
        for s in sentences:
            if len(current_chunk) + len(s) < 1000:
                current_chunk += s + ". "
            else:
                chunks.append({
                    "source": source_name,
                    "subtopic": "Detailed Narrative",
                    "content": current_chunk.strip()
                })
                current_chunk = s + ". "
        if current_chunk:
            chunks.append({
                "source": source_name,
                "subtopic": "Detailed Narrative",
                "content": current_chunk.strip()
            })
            
    return chunks

async def fetch_db_intel(client: httpx.AsyncClient):
    extra_chunks = []
    tables = ["products", "blog_posts", "job_listings", "team_members", "company_stats", "faqs"]
    for table in tables:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
            resp = await client.get(
                url, headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}, timeout=10.0
            )
            if resp.status_code == 200:
                data = resp.json()
                for entry in data:
                    v_list = [f"{str(v)}" for k, v in entry.items() if v and k not in ['id', 'created_at', 'images', 'image', 'icon']]
                    narrative = ". ".join(v_list)
                    extra_chunks.append({
                        "source": f"BEE_DB_{table.upper()}",
                        "subtopic": entry.get("name") or entry.get("title") or entry.get("question") or "BeeYield Record",
                        "content": narrative
                    })
        except: pass
    return extra_chunks

async def sync_all():
    print(f"[{time.ctime()}] PURIFYING KNOWLEDGE DATA...")
    kb_chunks = []
    for s_dir in SOURCE_DIRS:
        if not os.path.exists(s_dir): continue
        for root, _, files in os.walk(s_dir):
            for file in files:
                if file.endswith((".tsx", ".ts")):
                    try:
                        fpath = os.path.join(root, file)
                        with open(fpath, 'r', encoding='utf-8') as f:
                            content = f.read()
                            kb_chunks.extend(extract_structured_chunks(content, os.path.basename(fpath)))
                    except: continue

    async with httpx.AsyncClient() as client:
        if SUPABASE_URL and SUPABASE_KEY:
            kb_chunks.extend(await fetch_db_intel(client))

    master_kb = {
        "metadata": {"version": "6.0.0-ELITE", "last_sync": time.ctime(), "total_nodes": len(kb_chunks)},
        "dna": BEE_DNA_HARDCODED,
        "knowledge_nodes": kb_chunks
    }
    
    os.makedirs(os.path.dirname(KNOWLEDGE_PATH), exist_ok=True)
    with open(KNOWLEDGE_PATH, 'w', encoding='utf-8') as f:
        json.dump(master_kb, f, indent=2)
    print(f"[{time.ctime()}] KNOWLEDGE ENGINE PURIFIED. {len(kb_chunks)} NODES LIVE.")

if __name__ == "__main__":
    asyncio.run(sync_all())
