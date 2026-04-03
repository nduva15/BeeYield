"""
BeeYield Image Analysis Service — Rust-Accelerated
All compute (detection simulation, health classification, disease aggregation, recommendations) now flows through the Rust ImageEngine.
Python remains for I/O glue (image decoding, optional YOLO path).
"""
from typing import Dict, Any, List, Optional
import io
import time
import numpy as np
from PIL import Image, ImageDraw

from beeyield_core import ImageEngine as _RustEngine  # type: ignore

# Optional ML imports (used if available; otherwise we fall back to Rust simulation)
try:
    import cv2  # noqa: F401
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class ImageAnalysisService:
    MODEL_VERSION = "v1.1-rust"
    MAX_BEES_TO_CLASSIFY = 40
    
    _detector_model = None
    _engine = _RustEngine()
    
    @classmethod
    def _get_detector(cls):
        if not YOLO_AVAILABLE:
            return None
        if cls._detector_model is None:
            try:
                cls._detector_model = YOLO("yolov8n.pt")
            except Exception:
                return None
        return cls._detector_model
    
    @staticmethod
    async def analyze_image(
        image_bytes: bytes,
        user_id: str,
        hive_id: Optional[str] = None,
        apiary_id: Optional[str] = None,
        confidence_threshold: float = 0.4,
        overlap_threshold: float = 0.5,
        analysis_type: str = "full",
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = image.convert("RGB")
            width, height = image.size
        except Exception as e:
            return {"error": f"Invalid image: {str(e)}", "bee_count": 0, "processing_time_ms": 0}
        
        # 1) Detection (YOLO if present, otherwise Rust simulation)
        detections = await ImageAnalysisService._detect_bees(image_rgb, confidence_threshold, overlap_threshold)
        
        # 2) Health classification (Rust)
        if analysis_type in ["full", "health_only"] and detections:
            detections = ImageAnalysisService._engine.classify_health(detections)
        
        # 3) Aggregate diseases (Rust)
        disease_indicators = ImageAnalysisService._engine.aggregate_diseases(detections)
        disease_indicators.sort(key=lambda x: x["probability"], reverse=True)
        
        # 4) Health score (Rust)
        health_score, health_status = ImageAnalysisService._engine.calculate_health_score(len(detections), disease_indicators)
        
        # 5) Recommendations (Rust)
        recommendations = ImageAnalysisService._engine.generate_recommendations(health_status, disease_indicators, len(detections))
        
        processing_time = int((time.time() - start_time) * 1000)
        overall_confidence = round(sum(d.get("confidence", 0) for d in detections) / len(detections), 2) if detections else 0.0
        
        return {
            "bee_count": len(detections),
            "health_score": health_score,
            "health_status": health_status,
            "overall_confidence": overall_confidence,
            "detections": detections,
            "disease_indicators": disease_indicators,
            "recommendations": recommendations,
            "image_width": width,
            "image_height": height,
            "processing_time_ms": processing_time,
            "model_version": ImageAnalysisService.MODEL_VERSION,
        }
    
    @staticmethod
    async def _detect_bees(image: Image.Image, confidence_threshold: float, overlap_threshold: float) -> List[Dict[str, Any]]:
        width, height = image.size
        
        # YOLO path if available
        if YOLO_AVAILABLE:
            model = ImageAnalysisService._get_detector()
            if model:
                try:
                    results = model.predict(source=np.array(image), conf=confidence_threshold, iou=overlap_threshold, verbose=False)
                    detections = []
                    for res in results:
                        if res.boxes:
                            for i, box in enumerate(res.boxes):
                                x1, y1, x2, y2 = box.xyxy[0].tolist()
                                detections.append({
                                    "id": i + 1,
                                    "label": "Bee",
                                    "confidence": round(float(box.conf[0]), 2),
                                    "bbox": {"x": int(x1), "y": int(y1), "width": int(x2 - x1), "height": int(y2 - y1)},
                                })
                    if detections:
                        return detections[:100]
                except Exception:
                    pass
        
        # Rust simulation path
        img_array = np.array(image)
        brightness = np.mean(img_array)
        contrast = np.std(img_array)
        yellow_mask = (img_array[:, :, 0] > 150) & (img_array[:, :, 1] > 100) & (img_array[:, :, 2] < 100)
        yellow_ratio = np.sum(yellow_mask) / (width * height)
        
        return ImageAnalysisService._engine.simulate_detections(
            width, height, brightness, contrast, yellow_ratio, confidence_threshold
        )
    
    @staticmethod
    async def generate_annotated_image(image_bytes: bytes, detections: List[Dict[str, Any]]) -> Optional[bytes]:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = image.convert("RGB")
            draw = ImageDraw.Draw(image_rgb)
            colors = {"Healthy": (0, 255, 0), "Varroa": (255, 0, 0), "DWV": (255, 165, 0), "Nosema": (255, 255, 0), "Unknown": (128, 128, 128)}
            for d in detections:
                b = d.get("bbox", {})
                x, y, w, h = b.get("x", 0), b.get("y", 0), b.get("width", 50), b.get("height", 50)
                color = colors.get(d.get("health", "Unknown"), (128, 128, 128))
                draw.rectangle([x, y, x + w, y + h], outline=color, width=2)
            out = io.BytesIO()
            image_rgb.save(out, format="JPEG", quality=85)
            return out.getvalue()
        except Exception:
            return None
