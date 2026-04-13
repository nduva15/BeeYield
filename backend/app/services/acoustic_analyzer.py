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
from scipy.io import wavfile

logger = logging.getLogger(__name__)

# Add BEE-SOUND-ANALYSIS to Python path
REPO_PATH = Path(__file__).parent.parent.parent.parent / "beeyield-sound-analysis" / "BeeSound_Analysis"
sys.path.insert(0, str(REPO_PATH))

try:
    from pipeline.cleaner import AudioCleaner
    from pipeline.segmenter import AudioSegmenter
    from models.health_state import HealthStateClassifier
    from models.event_detector import EventDetector
    from models.species_id import SpeciesIdentifier
    from modules.osbh_engine import OSBHEngine
    logger.info("Using BEE-SOUND-ANALYSIS repository code")
except ImportError:
    logger.error("Failed to import BEE-SOUND-ANALYSIS repository")


class AcousticAnalyzer:
    SAMPLE_RATE = 22050
    MAX_ANALYSIS_SECONDS = 30

    def __init__(self, model_path: Optional[Path] = None):
        self.cleaner = AudioCleaner(sample_rate=self.SAMPLE_RATE)
        self.segmenter = AudioSegmenter(window_size=2.0, overlap=0.5, sample_rate=self.SAMPLE_RATE)
        self.species_identifier = SpeciesIdentifier()
        self.health_classifier = HealthStateClassifier()
        self.event_detector = EventDetector()
        self.osbh_engine = OSBHEngine()
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

    def _clean_audio(self, audio: np.ndarray) -> np.ndarray:
        if audio.size < 2048:
            return audio

        try:
            cleaned = self.cleaner.clean(audio, apply_bandpass=True, remove_background=True)
        except Exception as exc:
            logger.warning("Repo cleaner failed, falling back to normalized audio: %s", exc)
            cleaned = audio

        cleaned = np.nan_to_num(np.asarray(cleaned, dtype=np.float32), nan=0.0, posinf=0.0, neginf=0.0)
        if cleaned.size != audio.size:
            cleaned = librosa.util.fix_length(cleaned, size=audio.size)

        peak = float(np.max(np.abs(cleaned))) if cleaned.size else 0.0
        if peak > 0:
            cleaned = cleaned / peak

        return cleaned

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
        bee_coverage: float,
        osbh_state: Optional[str],
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
        if bee_coverage < 0.5:
            actions.append("Reduce non-bee background noise and place the microphone closer to hive traffic before the next recording.")
        if osbh_state == "QUEEN_MISSING":
            actions.append("Use the OSBH queen-missing alert as a priority check during the next hive inspection.")

        return actions[:4]

    def _run_osbh_analysis(self, audio: np.ndarray, sample_rate: int) -> Dict:
        temp_path: Optional[str] = None
        try:
            wav_audio = np.clip(audio, -1.0, 1.0)
            wav_audio = (wav_audio * np.iinfo(np.int16).max).astype(np.int16)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                wavfile.write(tmp.name, sample_rate, wav_audio)
                temp_path = tmp.name
            return self.osbh_engine.analyze_audio(temp_path)
        except Exception as exc:
            logger.warning("OSBH engine failed: %s", exc)
            return {"error": str(exc)}
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except OSError:
                    logger.warning("Could not remove temporary OSBH file: %s", temp_path)

    def analyze_audio_file(
        self,
        audio_bytes: bytes,
        filename: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> Dict:
        try:
            audio, sr = self._load_audio(audio_bytes, filename=filename, content_type=content_type)
            cleaned_audio = self._clean_audio(audio)
            signal_metrics = self._summarize_signal(cleaned_audio, sr)

            segments, timestamps = self.segmenter.segment_audio(audio_data=cleaned_audio, sr=sr)
            if not segments:
                segments = [cleaned_audio]
                timestamps = [0.0]

            results = []
            alert_levels: List[str] = []
            state_votes = {label: 0 for label in self.health_classifier.classes}
            state_confidences = {label: [] for label in self.health_classifier.classes}
            state_scores = {label: 0.0 for label in self.health_classifier.classes}
            species_votes: Dict[str, int] = {}
            species_confidences: Dict[str, List[float]] = {}
            piping_segments = 0
            bee_segments = 0
            timeline = []

            for segment, timestamp in zip(segments, timestamps):
                seg_np = np.array(segment, dtype=np.float32) if isinstance(segment, list) else np.asarray(segment, dtype=np.float32)
                if seg_np.size == 0:
                    continue

                species = self.species_identifier.predict(seg_np, sr)
                health = self.health_classifier.predict(seg_np, sr)
                event = self.event_detector.analyze(seg_np, sr)
                is_bee = bool(species.get("is_bee", False))
                species_name = species.get("species", "Unknown")
                species_votes[species_name] = species_votes.get(species_name, 0) + 1
                species_confidences.setdefault(species_name, []).append(float(species.get("confidence", 0.0)))

                state_votes[health["state"]] = state_votes.get(health["state"], 0) + 1
                state_confidences.setdefault(health["state"], []).append(float(health["confidence"]))
                state_scores[health["state"]] = state_scores.get(health["state"], 0.0) + float(health["confidence"]) * (1.0 if is_bee else 0.35)
                if event.get("piping", {}).get("detected", False):
                    piping_segments += 1
                alert_levels.append(event.get("alert_level", "NORMAL"))
                if is_bee:
                    bee_segments += 1

                timeline.append({
                    "timestamp_sec": round(float(timestamp), 2),
                    "species": species_name,
                    "is_bee": is_bee,
                    "state": health["state"],
                    "confidence": round(float(health["confidence"]), 4),
                    "alert_level": event.get("alert_level", "NORMAL"),
                })

                results.append({
                    "state": health["state"],
                    "confidence": health["confidence"],
                    "piping": event.get("piping", {}).get("detected", False),
                    "probabilities": health.get("probabilities", {}),
                    "alert_level": event.get("alert_level", "NORMAL"),
                    "hissing_detected": event.get("hissing", {}).get("detected", False),
                    "species": species_name,
                    "species_confidence": float(species.get("confidence", 0.0)),
                    "is_bee": is_bee,
                })

            if not results:
                raise ValueError("No analyzable audio segments were produced from the uploaded file")

            bee_coverage = bee_segments / max(len(results), 1)
            osbh_summary = self._run_osbh_analysis(cleaned_audio, sr)

            dominant_state = max(state_scores.items(), key=lambda item: item[1])[0]
            dominant_state_confidences = state_confidences.get(dominant_state, [])
            confidence = float(np.mean(dominant_state_confidences)) if dominant_state_confidences else 0.0
            primary_species = max(species_votes.items(), key=lambda item: item[1])[0] if species_votes else "Unknown"

            alert_level = "NORMAL"
            if "CRITICAL" in alert_levels:
                alert_level = "CRITICAL"
            elif "WARNING" in alert_levels:
                alert_level = "WARNING"

            state = dominant_state
            osbh_state = osbh_summary.get("state") if isinstance(osbh_summary, dict) else None
            if osbh_state == "QUEEN_MISSING":
                state = "Queenless"
                confidence = max(confidence, 0.82)
                if alert_level == "NORMAL":
                    alert_level = "WARNING"
            elif osbh_state == "LOW_ACTIVITY" and state == "Healthy":
                state = "Stressed"
            if piping_segments > 0 and state == "Healthy":
                state = "Swarming"
            if bee_coverage < 0.2:
                state = "Unknown"
                confidence = min(confidence, 0.45)

            classification_breakdown = {
                state: {
                    "segments": count,
                    "share": round(count / max(len(results), 1), 3),
                }
                for state, count in state_votes.items()
                if count > 0
            }

            details = {
                label: {
                    "segments": classification_breakdown[label]["segments"],
                    "avg_confidence": round(float(np.mean(values)), 4) if values else 0.0,
                }
                for label, values in state_confidences.items()
                if values
            }
            species_summary = {
                label: {
                    "segments": count,
                    "share": round(count / max(len(results), 1), 3),
                    "avg_confidence": round(float(np.mean(species_confidences.get(label, [0.0]))), 4),
                }
                for label, count in species_votes.items()
            }

            return {
                "state": state,
                "confidence": round(confidence, 4),
                "segments_analyzed": len(results),
                "piping_segments": piping_segments,
                "alert_level": alert_level,
                "alert": alert_level != "NORMAL" or piping_segments > 0,
                "signal_metrics": signal_metrics,
                "classification_breakdown": classification_breakdown,
                "recommended_actions": self._build_recommended_actions(
                    state,
                    alert_level,
                    signal_metrics,
                    piping_segments,
                    bee_coverage,
                    osbh_state,
                ),
                "hissing_detected": any(result.get("hissing_detected", False) for result in results),
                "details": details,
                "primary_species": primary_species,
                "species_summary": species_summary,
                "bee_coverage": round(bee_coverage, 3),
                "osbh_summary": osbh_summary,
                "segment_timeline": timeline,
            }
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
