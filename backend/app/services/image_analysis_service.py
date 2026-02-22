"""
BeeYield Image Analysis Service — Rust-Accelerated (Post-Oxidize)
================================================================
Portions of logic moved to `beeyield_core.ImageEngine` (Rust).
Moved: Detection simulation, disease aggregation, health scoring, NMS.
"""
from typing import Dict, Any, List, Optional, Tuple
import io
import time
from datetime import datetime
import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    from honey_rust import ImageEngine as _RustEngine
    _RUST_AVAILABLE = True
except ImportError:
    _RUST_AVAILABLE = False
    print("WARNING: honey_rust binary missing. Run 'maturin develop'.")

# Optional ML imports
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class ImageAnalysisService:
    MODEL_VERSION = "v1.0-rust"
    MAX_BEES_TO_CLASSIFY = 40
    
    _detector_model = None
    _engine = _RustEngine() if _RUST_AVAILABLE else None
    
    @classmethod
    def _get_detector(cls):
        if not YOLO_AVAILABLE: return None
        if cls._detector_model is None:
            try: cls._detector_model = YOLO("yolov8n.pt")
            except: return None
        return cls._detector_model
    
    @staticmethod
    async def analyze_image(
        image_bytes: bytes, user_id: str, 
        hive_id: Optional[str] = None, apiary_id: Optional[str] = None,
        confidence_threshold: float = 0.4, overlap_threshold: float = 0.5,
        analysis_type: str = "full"
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = image.convert('RGB')
            width, height = image.size
        except Exception as e:
            return {"error": f"Invalid image: {str(e)}", "bee_count": 0, "processing_time_ms": 0}
        
        # 1. Detection (Rust + YOLO)
        detections = await ImageAnalysisService._detect_bees(image_rgb, confidence_threshold, overlap_threshold)
        
        # 2. Health Classification (Simulation remains in Python for now)
        if analysis_type in ["full", "health_only"] and detections:
            detections = await ImageAnalysisService._classify_health(image_rgb, detections)
        
        # 3. Aggregate Diseases (RUST)
        if ImageAnalysisService._engine:
            disease_indicators = ImageAnalysisService._engine.aggregate_diseases(detections)
            # Sort indicators descending (Rust return is already sorted or we do it here)
            disease_indicators.sort(key=lambda x: x["probability"], reverse=True)
            
            # 4. Calculate Health Score (RUST)
            health_score, health_status = ImageAnalysisService._engine.calculate_health_score(len(detections), disease_indicators)
        else:
            # Fallback
            disease_indicators = []
            health_score, health_status = 0, "Unknown"
        
        # 5. Recommendations (Python - Copy logic)
        recommendations = ImageAnalysisService._generate_recommendations(health_status, disease_indicators, len(detections))
        
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
            "image_width": width, "image_height": height,
            "processing_time_ms": processing_time,
            "model_version": ImageAnalysisService.MODEL_VERSION
        }
    
    @staticmethod
    async def _detect_bees(image: Image.Image, confidence_threshold: float, overlap_threshold: float) -> List[Dict[str, Any]]:
        width, height = image.size
        
        # YOLO path
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
                                    "id": i+1, "label": "Bee", "confidence": round(float(box.conf[0]), 2),
                                    "bbox": {"x": int(x1), "y": int(y1), "width": int(x2-x1), "height": int(y2-y1)}
                                })
                    if detections: return detections[:100]
                except: pass
        
        # RUST SIMULATION PATH
        if ImageAnalysisService._engine:
            img_array = np.array(image)
            brightness = np.mean(img_array)
            contrast = np.std(img_array)
            # Efficient yellow detection
            yellow_mask = (img_array[:, :, 0] > 150) & (img_array[:, :, 1] > 100) & (img_array[:, :, 2] < 100)
            yellow_ratio = np.sum(yellow_mask) / (width * height)
            
            return ImageAnalysisService._engine.simulate_detections(
                width, height, brightness, contrast, yellow_ratio, confidence_threshold
            )
        
        return []

    # Original health classification simulation (remains in Python for now)
    @staticmethod
    async def _classify_health(image: Image.Image, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sorted_detections = sorted(detections, key=lambda x: x.get("confidence", 0), reverse=True)
        classified_count = 0
        for d in sorted_detections:
            if classified_count >= ImageAnalysisService.MAX_BEES_TO_CLASSIFY: break
            roll = np.random.random()
            if roll > 0.96: d["health"], d["health_confidence"] = "Varroa", round(np.random.uniform(0.6, 0.85), 2)
            elif roll > 0.93: d["health"], d["health_confidence"] = "DWV", round(np.random.uniform(0.5, 0.75), 2)
            elif roll > 0.91: d["health"], d["health_confidence"] = "Nosema", round(np.random.uniform(0.4, 0.65), 2)
            else: d["health"], d["health_confidence"] = "Healthy", round(np.random.uniform(0.85, 0.98), 2)
            classified_count += 1
        for d in detections:
            if "health" not in d: d["health"], d["health_confidence"] = "Unknown", 0.0
        return detections

    @staticmethod
    def _generate_recommendations(status: str, indicators: List[Dict[str, Any]], count: int) -> List[str]:
        # Implementation omitted for brevity, logic remains in Python as it's pure copy.
        # This part of the file is reused from the original service but minimized.
        recommendations = []
        if count == 0: return ["No bees detected. Photograph hive entrance peak activity."]
        if status == "Healthy": recommendations.extend(["Colony appears healthy.", "Continue regular monitoring every 7-10 days."])
        elif status == "Warning": recommendations.append("Some health concerns detected. Detailed inspection within 48h.")
        else: recommendations.append("⚠️ CRITICAL: Immediate hive inspection recommended.")
        
        for ind in indicators:
            d, p = ind["disease"], ind["probability"]
            if d == "Varroa" and p > 0.05: recommendations.append(f"Varroa mites ({int(p*100)}%). Use Oxalic/Formic acid.")
            elif d == "DWV" and p > 0.03: recommendations.append("DWV presence. Associated with Varroa - treat mites.")
            elif d == "Nosema" and p > 0.03: recommendations.append("Nosema possible. Check ventilation.")
        return recommendations

    @staticmethod
    async def generate_annotated_image(image_bytes: bytes, detections: List[Dict[str, Any]]) -> Optional[bytes]:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image_rgb = image.convert('RGB')
            draw = ImageDraw.Draw(image_rgb)
            colors = {"Healthy": (0,255,0), "Varroa": (255,0,0), "DWV": (255,165,0), "Nosema": (255,255,0), "Unknown": (128,128,128)}
            for d in detections:
                b = d.get("bbox", {})
                x, y, w, h = b.get("x",0), b.get("y",0), b.get("width",50), b.get("height",50)
                color = colors.get(d.get("health", "Unknown"), (128,128,128))
                draw.rectangle([x, y, x+w, y+h], outline=color, width=2)
            out = io.BytesIO()
            image_rgb.save(out, format='JPEG', quality=85)
            return out.getvalue()
        except: return None
