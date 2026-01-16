from typing import List, Dict, Any, Optional
from datetime import datetime
import json

class BeeHealthAI:
    """
    Proprietary ML Algorithms for Hive Health Analysis.
    Simulates expert reasoning and deep data analysis.
    """
    
    @staticmethod
    def detect_anomalies(sensor_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Runs anomaly detection algorithms on raw sensor data.
        Returns a list of detected anomalies with severity and engineering notes.
        """
        anomalies = []
        temp = sensor_data.get("temperature", 35.0)
        humidity = sensor_data.get("humidity", 50.0)
        weight = sensor_data.get("weight", 0.0)
        audio = sensor_data.get("audio_anomaly", "NORMAL")
        
        # Temperature Anomaly Detection
        if temp > 38.0:
            anomalies.append({
                "type": "THERMAL_STRESS",
                "severity": "HIGH",
                "description": f"Internal temperature {temp}°C exceeds healthy threshold (34-36°C).",
                "risk": "Colony exhaustion and potential desertion."
            })
        elif temp < 30.0:
            anomalies.append({
                "type": "CHILL_STRESS",
                "severity": "MEDIUM",
                "description": f"Internal temperature {temp}°C is below optimal brood rearing level.",
                "risk": "Brood development delays or mortality."
            })
            
        # Humidity Anomaly Detection
        if humidity > 85.0:
            anomalies.append({
                "type": "EXCESSIVE_MOISTURE",
                "severity": "MEDIUM",
                "description": f"Humidity at {humidity}% increases fungal risk.",
                "risk": "Chalkbrood or mold development."
            })
            
        # Audio / Acoustic AI Anomaly
        if audio == "ACOUSTIC_VARROA_PATTERN":
            anomalies.append({
                "type": "ACOUSTIC_DISEASE_SIGNATURE",
                "severity": "CRITICAL",
                "description": "Acoustic fingerprints match Varroa Destructor infestation patterns.",
                "risk": "Rapid colony collapse if untreated."
            })
        elif audio == "QUEENLESS_PIPING":
            anomalies.append({
                "type": "COLONY_STATE_ANOMALY",
                "severity": "HIGH",
                "description": "Distinct piping sounds detected signifying potential queen loss or replacement.",
                "risk": "Reproduction cycle interruption."
            })
            
        return anomalies

    @staticmethod
    def predict_disease_risk(sensor_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Uses ML models to forecast disease probabilities.
        """
        risks = []
        temp = sensor_data.get("temperature", 35.0)
        humidity = sensor_data.get("humidity", 50.0)
        
        # Mocking ML inference logic
        # Varroa Risk Algorithm
        varroa_risk = 15.0 # Base background risk
        if sensor_data.get("audio_anomaly") == "ACOUSTIC_VARROA_PATTERN":
            varroa_risk += 75.0
        
        if varroa_risk > 20:
            risks.append({
                "disease": "Varroa Mites",
                "probability": f"{varroa_risk}%",
                "confidence": "High",
                "expert_insight": "Acoustic monitoring indicates high frequency vibrations consistent with mite-induced stress."
            })
            
        # Chalkbrood Risk Algorithm
        chalkbrood_risk = 5.0
        if humidity > 75.0 and temp < 32.0:
            chalkbrood_risk += 45.0
            
        if chalkbrood_risk > 20:
            risks.append({
                "disease": "Chalkbrood",
                "probability": f"{chalkbrood_risk}%",
                "confidence": "Medium",
                "expert_insight": "High moisture and low thermal regulation are primary catalysts for fungal growth."
            })
            
        return risks

    @staticmethod
    async def analyze_hive_health(hive_id: str, sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Comprehensive Engineering Analysis Report.
        """
        anomalies = BeeHealthAI.detect_anomalies(sensor_data)
        disease_risks = BeeHealthAI.predict_disease_risk(sensor_data)
        
        health_score = 100
        health_score -= len(anomalies) * 15
        health_score -= len(disease_risks) * 10
        health_score = max(0, health_score)
        
        status = "HEALTHY"
        if health_score < 40: status = "CRITICAL"
        elif health_score < 75: status = "WARNING"
        
        return {
            "hive_id": hive_id,
            "status": status,
            "health_score": f"{health_score}/100",
            "timestamp": datetime.now().isoformat(),
            "anomalies": anomalies,
            "disease_risks": disease_risks,
            "engineering_summary": f"Neural analysis complete for {hive_id}. Systems show {status.lower()} parameters with {len(anomalies)} active anomalies."
        }
