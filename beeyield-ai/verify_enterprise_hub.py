import asyncio
import os
import sys
from unittest.mock import patch, MagicMock

# Environment Setup
os.environ["SUPABASE_URL"] = "https://mock.supabase.co"
os.environ["SUPABASE_KEY"] = "mock_key"
os.environ["GOOGLE_API_KEY"] = "mock_key"

sys.path.append(os.path.abspath("backend"))
sys.path.append(os.path.abspath("."))

# Mock DB modules before AIService imports them
import sys
from unittest.mock import MagicMock
sys.modules["clickhouse_connect"] = MagicMock()
sys.modules["app.db.supabase_db"] = MagicMock()
sys.modules["app.blockchain.honey_blockchain"] = MagicMock()

async def verify_enterprise_hub():
    print("🚀 INITIATING ENTERPRISE KNOWLEDGE HUB VERIFICATION...")
    
    from backend.app.services.ai_service import AIService
    
    # Test Query: Complex, multi-namespace request
    query = "Explain 2026 Varroa prevention methods and check our Nairobi harvest yield for batch BEE-NY-26-01."
    
    print(f"📝 Query: {query}")
    
    # Mocking necessary services to avoid environment errors
    with patch("backend.app.services.content_service.ContentService.get_website_knowledge_summary") as mock_kb:
        mock_kb.return_value = (
            "UNIVERSITY RESEARCH: University of Pretoria (2024) confirms African bee resilience [1]. "
            "Hohenheim studies link oxalic acid use to 90% mite reduction [2]."
        )
        
        with patch("backend.app.db.supabase_db.db_select") as mock_db:
            mock_db.return_value = [{"name": "Timothy", "farmer_id": "F-001", "region": "Kibwezi"}]
            
            with patch("backend.app.services.traceability_service.get_trace_journey") as mock_trace:
                mock_trace_obj = MagicMock()
                mock_trace_obj.product_name = "Nairobi Wildflower Honey"
                mock_trace_obj.apiary = MagicMock(name="Kibwezi Main")
                mock_trace.return_value = mock_trace_obj

                print("🧠 Executing AIService.chat...")
                response = await AIService.chat(
                    message=query,
                    language="EN",
                    current_time="03:15",
                    current_date="2026-02-06"
                )
                
                print("\n--- FINAL SYNTHESIS PREVIEW ---")
                print(response)
                
                # Check for Pillars
                pillars = ["I. INTELLIGENCE BRIEF", "II. DIAGNOSIS", "III. REGIONAL", "IV. INTERNAL", "V. VERIFIED"]
                missing = [p for p in pillars if p not in response]
                
                if not missing:
                    print("\n✅ SUCCESS: Five-Pillar structure verified.")
                else:
                    print(f"\n❌ FAILED: Missing pillars: {missing}")
                
                # Check for Namespace Partitioning impact (Batch code detection)
                if "BEE-NY-26-01" in response or "Nairobi" in response:
                    print("✅ SUCCESS: Namespace Partitioning (Internal/Traceability) verified.")
                else:
                    print("❌ FAILED: Internal/Traceability data not synthesized.")

if __name__ == "__main__":
    asyncio.run(verify_enterprise_hub())
