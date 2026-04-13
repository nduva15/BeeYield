"""
Acoustic Analyzer - Rust-Accelerated (Post-Oxidize)
===================================================
Segmenting and results aggregation moved to `beeyield_core.AcousticEngine`.
Computationally expensive voting and windowing now runs in Rust.
"""
import sys
import os
import math
import tempfile
import logging
from pathlib import Path
from typing import Dict, Optional, List, Tuple

import librosa
import numpy as np

from beeyield_core import AcousticEngine as _RustEngine  # type: ignore

logger = logging.getLogger(__name__)

# Add BEE-SOUND-ANALYSIS to Python path
REPO_PATH = Path(__file__).parent.parent.parent.parent / "beeyield-sound-analysis" / "BeeSound_Analysis"
sys.path.insert(0, str(REPO_PATH))

try:
    from models.health_state import HealthStateClassifier
    from models.event_detector import EventDetector
    logger.info("Using BEE-SOUND-ANALYSIS repository code")
except ImportError:
    logger.error("Failed to import BEE-SOUND-ANALYSIS repository")


class AcousticAnalyzer:
    SAMPLE_RATE = 22050
    MAX_ANALYSIS_SECONDS = 30

    def __init__(self, model_path: Optional[Path] = None):
        self.health_classifier = HealthStateClassifier()
        self.event_detector = EventDetector()
        self._engine = _RustEngine()
        self.model_path = model_path

    def _resolve_suffix(self, filename: Optional[str], content_type: Optional[str]) -> str:
        extension = Path(filename or "").suffix.lower()
        if extension:
            return extension

        mapping = {
            "audio/wav": ".wav",
            "audio/x-wav": ".wav",
            "audio/wave": ".wav",
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/ogg": ".ogg",
            "audio/webm": ".webm",
            "audio/mp4": ".m4a",
            "audio/x-m4a": ".m4a",
            "audio/flac": ".flac",
        }
        return mapping.get((content_type or "").lower(), ".wav")

    def _load_audio(
        self,
        audio_bytes: bytes,
        filename: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> Tuple[np.ndarray, int]:
        if not audio_bytes:
            raise ValueError("Empty audio payload received")

        temp_path: Optional[str] = None
        try:
            suffix = self._resolve_suffix(filename, content_type)
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(audio_bytes)
                tmp.flush()
                temp_path = tmp.name

            audio, sr = librosa.load(
                temp_path,
                sr=self.SAMPLE_RATE,
                mono=True,
                duration=self.MAX_ANALYSIS_SECONDS,
            )
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except OSError:
                    logger.warning("Could not remove temporary acoustic file: %s", temp_path)

        if audio.size == 0:
            raise ValueError("Unable to decode a usable audio signal from the uploaded file")

        audio = np.nan_to_num(audio.astype(np.float32), nan=0.0, posinf=0.0, neginf=0.0)
        peak = float(np.max(np.abs(audio))) if audio.size else 0.0
        if peak > 0:
            audio = audio / peak

        return audio, sr

    def _summarize_signal(self, audio: np.ndarray, sample_rate: int) -> Dict:
        duration_s = float(librosa.get_duration(y=audio, sr=sample_rate))
        rms = librosa.feature.rms(y=audio)[0]
        rms_mean = float(np.mean(rms)) if rms.size else 0.0
        rms_db = 20.0 * math.log10(max(rms_mean, 1e-6))

        centroid = librosa.feature.spectral_centroid(y=audio, sr=sample_rate)[0]
        bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sample_rate)[0]
        rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sample_rate)[0]
        zcr = librosa.feature.zero_crossing_rate(audio)[0]

        harmonic, percussive = librosa.effects.hpss(audio)
        harmonic_energy = float(np.mean(np.abs(harmonic))) if harmonic.size else 0.0
        percussive_energy = float(np.mean(np.abs(percussive))) if percussive.size else 0.0

        spectrum = np.abs(np.fft.rfft(audio))
        freqs = np.fft.rfftfreq(len(audio), d=1.0 / sample_rate)
        dominant_idx = int(np.argmax(spectrum)) if spectrum.size else 0
        dominant_frequency_hz = float(freqs[dominant_idx]) if freqs.size else 0.0

        signal_strength = max(0.0, min(1.0, (rms_db + 60.0) / 45.0))
        if signal_strength >= 0.78:
            quality_band = "strong"
        elif signal_strength >= 0.45:
            quality_band = "usable"
        else:
            quality_band = "weak"

        return {
            "duration_seconds": round(duration_s, 2),
            "rms_db": round(rms_db, 2),
            "spectral_centroid_hz": round(float(np.mean(centroid)) if centroid.size else 0.0, 2),
            "spectral_bandwidth_hz": round(float(np.mean(bandwidth)) if bandwidth.size else 0.0, 2),
            "spectral_rolloff_hz": round(float(np.mean(rolloff)) if rolloff.size else 0.0, 2),
            "zero_crossing_rate": round(float(np.mean(zcr)) if zcr.size else 0.0, 4),
            "dominant_frequency_hz": round(dominant_frequency_hz, 2),
            "harmonic_ratio": round(
                harmonic_energy / max(harmonic_energy + percussive_energy, 1e-6),
                3,
            ),
            "signal_strength": round(signal_strength, 3),
            "signal_quality": quality_band,
        }

    def _build_recommended_actions(
        self,
        state: str,
        alert_level: str,
        signal_metrics: Dict,
        piping_segments: int,
    ) -> List[str]:
        actions: List[str] = []

        if alert_level == "CRITICAL" or state == "Swarming":
            actions.append("Inspect this hive immediately for swarm preparation and queen piping.")
            actions.append("Prepare a split or swarm control intervention within the next inspection window.")
        elif state == "Queenless":
            actions.append("Check for queen presence, eggs, and emergency queen cells.")
            actions.append("Compare against brood pattern and hive strength before requeening.")
        elif state == "Stressed":
            actions.append("Review heat, ventilation, forage, and pest pressure around the hive.")
        else:
            actions.append("Maintain normal monitoring cadence and compare the next sample against this baseline.")

        if signal_metrics.get("signal_quality") == "weak":
            actions.append("Capture a longer and cleaner recording closer to the brood chamber for higher-confidence analysis.")
        if piping_segments > 0 and alert_level != "CRITICAL":
            actions.append("Re-sample during a quieter window to verify the piping-like segments.")

        return actions[:4]

    def analyze_audio_file(
        self,
        audio_bytes: bytes,
        filename: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> Dict:
        try:
            audio, sr = self._load_audio(audio_bytes, filename=filename, content_type=content_type)
            signal_metrics = self._summarize_signal(audio, sr)

            segments = self._engine.segment_audio(audio.tolist(), sr)
            if not segments:
                segments = [audio.tolist()]

            results = []
            alert_levels: List[str] = []
            state_votes = {label: 0 for label in self.health_classifier.classes}
            piping_segments = 0

            for segment in segments:
                seg_np = np.array(segment, dtype=np.float32) if isinstance(segment, list) else np.asarray(segment, dtype=np.float32)
                if seg_np.size == 0:
                    continue

                health = self.health_classifier.predict(seg_np, sr)
                event = self.event_detector.analyze(seg_np, sr)

                state_votes[health["state"]] = state_votes.get(health["state"], 0) + 1
                if event.get("piping", {}).get("detected", False):
                    piping_segments += 1
                alert_levels.append(event.get("alert_level", "NORMAL"))

                results.append({
                    "state": health["state"],
                    "confidence": health["confidence"],
                    "piping": event.get("piping", {}).get("detected", False),
                    "probabilities": health.get("probabilities", {}),
                    "alert_level": event.get("alert_level", "NORMAL"),
                    "hissing_detected": event.get("hissing", {}).get("detected", False),
                })

            if not results:
                raise ValueError("No analyzable audio segments were produced from the uploaded file")

            aggregated = self._engine.aggregate_results(results)

            alert_level = "NORMAL"
            if "CRITICAL" in alert_levels:
                alert_level = "CRITICAL"
            elif "WARNING" in alert_levels:
                alert_level = "WARNING"

            classification_breakdown = {
                state: {
                    "segments": count,
                    "share": round(count / max(len(results), 1), 3),
                }
                for state, count in state_votes.items()
                if count > 0
            }

            aggregated["segments_analyzed"] = aggregated.get("segments_analyzed", len(results))
            aggregated["piping_segments"] = aggregated.get("piping_segments", piping_segments)
            aggregated["alert_level"] = alert_level
            aggregated["alert"] = aggregated.get("alert", False) or alert_level != "NORMAL"
            aggregated["signal_metrics"] = signal_metrics
            aggregated["classification_breakdown"] = classification_breakdown
            aggregated["recommended_actions"] = self._build_recommended_actions(
                aggregated.get("state", "Unknown"),
                alert_level,
                signal_metrics,
                aggregated["piping_segments"],
            )
            aggregated["hissing_detected"] = any(result.get("hissing_detected", False) for result in results)
            return aggregated
        except Exception as e:
            logger.error("Analysis failed: %s", e)
            raise


_analyzer_instance: Optional[AcousticAnalyzer] = None


def get_analyzer() -> AcousticAnalyzer:
    global _analyzer_instance
    if _analyzer_instance is None:
        model_path = Path(__file__).parent.parent.parent / "brain" / "beesound_best.pth"
        _analyzer_instance = AcousticAnalyzer(model_path if model_path.exists() else None)
    return _analyzer_instance


def initialize_analyzer():
    return get_analyzer()
