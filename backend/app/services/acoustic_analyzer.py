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

try:
    from beeyield_core import AcousticEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False

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
        self._engine = _RustEngine() if _RUST_AVAILABLE else None
        
    def analyze_audio_file(self, audio_bytes: bytes) -> Dict:
        try:
            # 1. Load audio (Python)
            audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)
            
            # 2. Segmenting (RUST)
            if self._engine:
                segments = self._engine.segment_audio(audio.tolist(), sr)
            else:
                # Fallback windowing
                win = int(2.0 * sr)
                segments = [audio[i:i+win] for i in range(0, len(audio)-win, win)]
            
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
            if self._engine:
                return self._engine.aggregate_results(results)
            else:
                return self._aggregate_results_fallback(results)
                
        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            raise

    def _aggregate_results_fallback(self, results: List[Dict]) -> Dict:
        # Minimal Python fallback for voting
        if not results: return {'state': 'Unknown', 'confidence': 0.0}
        states = [r['state'] for r in results]
        winner = max(set(states), key=states.count)
        conf = np.mean([r['confidence'] for r in results if r['state'] == winner])
        return {'state': winner, 'confidence': float(conf), 'segments_analyzed': len(results)}

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
