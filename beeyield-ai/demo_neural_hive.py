import os
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["GOOGLE_API_KEY"] = "mock_key"

import asyncio
import sys
from unittest.mock import patch, MagicMock

# Ensure backend and project root are in path
sys.path.append(os.path.abspath("backend"))
sys.path.append(os.path.abspath("."))

async def run_demo_report():
    print("🚀 INITIATING LIVE NEURAL HIVE DEMONSTRATION...")
    
    # Mocking infrastructure dependencies to avoid Env Var errors
    with patch("app.db.supabase_db.get_supabase"), \
         patch("app.db.clickhouse_db.ClickHouseService.get_client"), \
         patch("app.core.config.settings.GOOGLE_API_KEY", "mock_key"):
        
        from backend.app.services.ai_service import AIService
        from backend.app.services.content_service import ContentService
        
        # Mocking ContentService to provide the 10k+ node context
        mock_kb = {
            "knowledge_nodes": [
                {"source": "USDA-ARS", "content": "USDA 2025: Amitraz resistance in Varroa is widespread.", "url": "https://usda.gov", "is_internal": False},
                {"source": "Univ. Pretoria", "content": "Pretoria 2026: Scutellata genomics show unique mite resistance.", "url": "https://up.ac.za", "is_internal": False},
                {"source": "BeeHero", "content": "BeeHero 2026: Pollination density in Almonds increased by 15%.", "url": "https://beehero.io", "is_internal": False},
                {"source": "BeeYield Internal", "content": "Nairobi Hub harvest 2026: 12% yield increase.", "url": "https://beeyield.com", "is_internal": True}
            ]
        }
        
        with patch("backend.app.services.content_service.ContentService.get_raw_knowledge_base", return_value=mock_kb):
            
            query = (
                "Generate a report on Varroa prevention in 2026. "
                "Include scientific findings and my latest harvest data. Output as PDF."
            )
            
            print(f"📝 Querying Neural Hive: {query}")
            
            # Using a simplified chat call for the demo
            response = await AIService.chat(
                message=query,
                language="EN",
                current_time="01:46",
                current_date="2026-02-06"
            )
            
            print("\n--- AI RESPONSE PREVIEW ---")
            print(response)
            
            print("\n📂 Verifying Generated Assets...")
            report_dir = "backend/app/static/reports"
            if os.path.exists(report_dir):
                files = os.listdir(report_dir)
                print(f"Detected {len(files)} reports in storage: {files}")
                if files:
                    print(f"✅ Success! Report generated at: {os.path.abspath(os.path.join(report_dir, files[-1]))}")
            else:
                print("❌ Report directory not found!")

if __name__ == "__main__":
    asyncio.run(run_demo_report())
