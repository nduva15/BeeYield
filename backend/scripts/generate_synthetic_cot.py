"""
Stage 1 & 2: Dataset Extraction & Rationale-Based Distillation (REAL DATA ONLY)
Extracts and builds training pairs exclusively from existing verified BeeYield data:
- bee_encyclopedia.json (25 diseases/pests, 8 species, 10 pollination crops)
- knowledge_base.json (BeeYield DNA & IoT telemetry)
- ceba_context_engine.py (Real sentinel hives & apiaries)
- distillation_candidates.jsonl (Real production escalated queries)

ZERO GUESSING. ZERO FAKE DATA.
"""

from scripts.extract_real_distillation_corpus import main

if __name__ == "__main__":
    main()
