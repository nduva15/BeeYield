import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class ManifestManager:
    """
    Manifest Manager for the Google of Apis (3500+ Sources).
    Tracks source health, indexing status, and repository coverage.
    """
    
    def __init__(self, manifest_path: str = "data/manifest.json"):
        self.manifest_path = Path(manifest_path)
        self.data_dir = Path("data/research_batch")
        self.manifest = self._load_manifest()

    def _load_manifest(self) -> Dict[str, Any]:
        if self.manifest_path.exists():
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "version": "1.0",
            "last_audit": None,
            "total_sources": 0,
            "hubs": {
                "AFRICAN": 0,
                "EUROPEAN": 0,
                "ASIAN": 0,
                "CORPORATE": 0,
                "ACADEMIC": 0
            },
            "sources": {}
        }

    def audit_ingested_data(self):
        """Scans the research_batch directory and updates the manifest."""
        print("🔍 Auditing ingested datasets...")
        
        batch_files = list(self.data_dir.glob("batch_*.json"))
        total_docs = 0
        
        for file in batch_files:
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    batch_data = json.load(f)
                    source_name = file.stem.replace("batch_", "")
                    
                    count = len(batch_data)
                    total_docs += count
                    
                    # Update manifest entry
                    self.manifest["sources"][source_name] = {
                        "file": str(file),
                        "doc_count": count,
                        "last_seen": datetime.now().isoformat(),
                        "status": "INDEXED" if count > 0 else "EMPTY"
                    }
                    
                    # Hub distribution (Rough estimation based on source name)
                    if "african" in source_name.lower(): self.manifest["hubs"]["AFRICAN"] += count
                    elif "corporate" in source_name.lower(): self.manifest["hubs"]["CORPORATE"] += count
                    elif "ncbi" in source_name.lower() or "pubmed" in source_name.lower(): self.manifest["hubs"]["ACADEMIC"] += count
                    
            except Exception as e:
                print(f"⚠️ Error auditing {file}: {e}")

        self.manifest["total_sources"] = total_docs
        self.manifest["last_audit"] = datetime.now().isoformat()
        self.save_manifest()
        
        print(f"✅ Audit complete. Tracked {total_docs} documents across {len(batch_files)} batches.")

    async def check_link_health(self):
        """Verifies the reachability of source URLs in the manifest."""
        print("🔗 Checking source link health...")
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            for source_name, info in self.manifest["sources"].items():
                # In a real scenario, we'd check every doc URL. 
                # For manifest health, we check the primary source metadata URL if available.
                url = info.get("url")
                if url:
                    try:
                        resp = await client.get(url)
                        info["link_status"] = "OK" if resp.status_code == 200 else f"ERROR_{resp.status_code}"
                    except Exception:
                        info["link_status"] = "TIMEOUT"
                else:
                    info["link_status"] = "NO_URL_DEFINED"
        
        self.save_manifest()
        print("✅ Link health check complete.")

    def save_manifest(self):
        self.manifest_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.manifest_path, 'w', encoding='utf-8') as f:
            json.dump(self.manifest, f, indent=4)

    def get_summary(self):
        m = self.manifest
        summary = f"--- GOOGLE OF APIS MANIFEST SUMMARY ---\n"
        summary += f"Total Documents: {m['total_sources']}\n"
        summary += f"Last Audit: {m['last_audit']}\n"
        summary += f"Hub Coverage:\n"
        for hub, count in m['hubs'].items():
            summary += f"  - {hub}: {count}\n"
        return summary

if __name__ == "__main__":
    manager = ManifestManager()
    manager.audit_ingested_data()
    print(manager.get_summary())
