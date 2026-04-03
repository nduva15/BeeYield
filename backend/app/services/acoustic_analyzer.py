"""
Acoustic Analyzer — Rust-Accelerated (Post-Oxidize)
==================================================
Segmenting and results aggregation moved to `beeyield_core.AcousticEngine`.
Computationally expensive voting and windowing now runs in Rust.
"""
import sys
import io
import librosa
import numpy as np
from pathlib import Path
from typing import Dict, Optional, List
import logging

from beeyield_core import AcousticEngine as _RustEngine  # type: ignore

logger = logging.getLogger(__name__)

# Add BEE-SOUND-ANALYSIS to Python path
REPO_PATH = Path(__file__).parent.parent.parent.parent / "beeyield-sound-analysis" / "BeeSound_Analysis"
sys.path.insert(0, str(REPO_PATH))

try:
    from models.health_state import HealthStateClassifier
    from models.event_detector import EventDetector
    logger.info("✅ Using BEE-SOUND-ANALYSIS repository code")
except ImportError:
    logger.error("❌ Failed to import BEE-SOUND-ANALYSIS repository")


class AcousticAnalyzer:
    def __init__(self, model_path: Optional[Path] = None):
        self.health_classifier = HealthStateClassifier()
        self.event_detector = EventDetector()
        self._engine = _RustEngine()
        
    def analyze_audio_file(self, audio_bytes: bytes) -> Dict:
        try:
            # 1. Load audio (Python)
            audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)
            
            # 2. Segmenting (RUST)
            segments = self._engine.segment_audio(audio.tolist(), sr)
            
            results = []
            for segment in segments:
                # Convert back to numpy for research models
                seg_np = np.array(segment) if isinstance(segment, list) else segment
                
                # Inference (Research models in Python)
                health = self.health_classifier.predict(seg_np, sr)
                event = self.event_detector.analyze(seg_np, sr)
                
                results.append({
                    'state': health['state'],
                    'confidence': health['confidence'],
                    'piping': event.get('piping', {}).get('detected', False)
                })
            
            # 3. Aggregation (RUST)
            return self._engine.aggregate_results(results)
                
        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            raise

# Singleton management preserved
_analyzer_instance: Optional[AcousticAnalyzer] = None

def get_analyzer() -> AcousticAnalyzer:
    global _analyzer_instance
    if _analyzer_instance is None:
        model_path = Path(__file__).parent.parent.parent / "brain" / "beesound_best.pth"
        _analyzer_instance = AcousticAnalyzer(model_path if model_path.exists() else None)
    return _analyzer_instance

def initialize_analyzer():
    return get_analyzer()
