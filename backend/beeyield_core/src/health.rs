//! Hive Health Engine — Port of `bee_health_ai.py`
//!
//! Pure compute module. Zero I/O. All anomaly detection, disease risk
//! prediction, and health scoring runs entirely in Rust.
//!
//! Python usage:
//! ```python
//! from beeyield_core import HiveHealthEngine
//! engine = HiveHealthEngine()
//! engine.load_sensor_data(temperature=37.5, humidity=80.0, weight=25.0, audio_anomaly="NORMAL")
//! anomalies = engine.detect_anomalies()
//! risks = engine.predict_disease_risk()
//! report = engine.full_analysis("hive-001")
//! ```

use pyo3::prelude::*;
use pyo3::types::PyDict;
use serde::{Deserialize, Serialize};

// ─── Internal Data Structures (Rust-owned, never copied to Python) ───

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SensorData {
    temperature: f64,
    humidity: f64,
    weight: f64,
    audio_anomaly: String,
}

impl Default for SensorData {
    fn default() -> Self {
        Self {
            temperature: 35.0,
            humidity: 50.0,
            weight: 0.0,
            audio_anomaly: "NORMAL".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Anomaly {
    anomaly_type: String,
    severity: String,
    description: String,
    risk: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct DiseaseRisk {
    disease: String,
    probability: f64,
    confidence: String,
    expert_insight: String,
}

// ─── PyO3 Class — Python holds a reference, Rust owns all state ───

/// High-performance hive health analysis engine.
/// Replaces `BeeHealthAI` class from `bee_health_ai.py`.
#[pyclass]
pub struct HiveHealthEngine {
    sensor_data: SensorData,
    anomalies: Vec<Anomaly>,
    disease_risks: Vec<DiseaseRisk>,
    computed: bool,
}

#[pymethods]
impl HiveHealthEngine {
    #[new]
    fn new() -> Self {
        Self {
            sensor_data: SensorData::default(),
            anomalies: Vec::new(),
            disease_risks: Vec::new(),
            computed: false,
        }
    }

    /// Load sensor data. Data stays in Rust — no serialization.
    #[pyo3(signature = (temperature=35.0, humidity=50.0, weight=0.0, audio_anomaly="NORMAL"))]
    fn load_sensor_data(
        &mut self,
        temperature: f64,
        humidity: f64,
        weight: f64,
        audio_anomaly: &str,
    ) {
        self.sensor_data = SensorData {
            temperature,
            humidity,
            weight,
            audio_anomaly: audio_anomaly.to_string(),
        };
        self.computed = false;
        self.anomalies.clear();
        self.disease_risks.clear();
    }

    /// Run anomaly detection. Returns list of dicts.
    fn detect_anomalies<'py>(&mut self, py: Python<'py>) -> PyResult<Vec<Bound<'py, PyDict>>> {
        self.run_anomaly_detection();

        self.anomalies
            .iter()
            .map(|a| {
                let dict = PyDict::new_bound(py);
                dict.set_item("type", &a.anomaly_type)?;
                dict.set_item("severity", &a.severity)?;
                dict.set_item("description", &a.description)?;
                dict.set_item("risk", &a.risk)?;
                Ok(dict)
            })
            .collect()
    }

    /// Predict disease risk. Returns list of dicts.
    fn predict_disease_risk<'py>(&mut self, py: Python<'py>) -> PyResult<Vec<Bound<'py, PyDict>>> {
        self.run_disease_prediction();

        self.disease_risks
            .iter()
            .map(|r| {
                let dict = PyDict::new_bound(py);
                dict.set_item("disease", &r.disease)?;
                dict.set_item("probability", format!("{}%", r.probability))?;
                dict.set_item("confidence", &r.confidence)?;
                dict.set_item("expert_insight", &r.expert_insight)?;
                Ok(dict)
            })
            .collect()
    }

    /// Get computed health score (0–100).
    fn health_score(&mut self) -> u32 {
        if !self.computed {
            self.run_anomaly_detection();
            self.run_disease_prediction();
        }
        let score = 100i32
            - (self.anomalies.len() as i32 * 15)
            - (self.disease_risks.len() as i32 * 10);
        score.max(0) as u32
    }

    /// Full analysis — single FFI call, all computation in Rust.
    fn full_analysis<'py>(&mut self, py: Python<'py>, hive_id: &str) -> PyResult<Bound<'py, PyDict>> {
        self.run_anomaly_detection();
        self.run_disease_prediction();

        let score = self.health_score();
        let status = match score {
            0..=39 => "CRITICAL",
            40..=74 => "WARNING",
            _ => "HEALTHY",
        };

        let result = PyDict::new_bound(py);
        result.set_item("hive_id", hive_id)?;
        result.set_item("status", status)?;
        result.set_item("health_score", format!("{}/100", score))?;
        result.set_item(
            "timestamp",
            chrono::Utc::now().to_rfc3339(),
        )?;

        // Anomalies as list of dicts
        let anomalies = self.detect_anomalies(py)?;
        result.set_item("anomalies", anomalies)?;

        // Disease risks as list of dicts
        let risks = self.predict_disease_risk(py)?;
        result.set_item("disease_risks", risks)?;

        result.set_item(
            "engineering_summary",
            format!(
                "Rust analysis complete for {}. Systems show {} parameters with {} active anomalies.",
                hive_id,
                status.to_lowercase(),
                self.anomalies.len()
            ),
        )?;

        Ok(result)
    }
}

// ─── Internal Logic (never crosses FFI boundary) ───

impl HiveHealthEngine {
    fn run_anomaly_detection(&mut self) {
        self.anomalies.clear();
        let temp = self.sensor_data.temperature;
        let humidity = self.sensor_data.humidity;
        let audio = &self.sensor_data.audio_anomaly;

        // Thermal stress
        if temp > 38.0 {
            self.anomalies.push(Anomaly {
                anomaly_type: "THERMAL_STRESS".into(),
                severity: "HIGH".into(),
                description: format!(
                    "Internal temperature {:.1}°C exceeds healthy threshold (34-36°C).",
                    temp
                ),
                risk: "Colony exhaustion and potential desertion.".into(),
            });
        } else if temp < 30.0 {
            self.anomalies.push(Anomaly {
                anomaly_type: "CHILL_STRESS".into(),
                severity: "MEDIUM".into(),
                description: format!(
                    "Internal temperature {:.1}°C is below optimal brood rearing level.",
                    temp
                ),
                risk: "Brood development delays or mortality.".into(),
            });
        }

        // Humidity
        if humidity > 85.0 {
            self.anomalies.push(Anomaly {
                anomaly_type: "EXCESSIVE_MOISTURE".into(),
                severity: "MEDIUM".into(),
                description: format!("Humidity at {:.0}% increases fungal risk.", humidity),
                risk: "Chalkbrood or mold development.".into(),
            });
        }

        // Acoustic signatures
        if audio == "ACOUSTIC_VARROA_PATTERN" {
            self.anomalies.push(Anomaly {
                anomaly_type: "ACOUSTIC_DISEASE_SIGNATURE".into(),
                severity: "CRITICAL".into(),
                description:
                    "Acoustic fingerprints match Varroa Destructor infestation patterns.".into(),
                risk: "Rapid colony collapse if untreated.".into(),
            });
        } else if audio == "QUEENLESS_PIPING" {
            self.anomalies.push(Anomaly {
                anomaly_type: "COLONY_STATE_ANOMALY".into(),
                severity: "HIGH".into(),
                description:
                    "Distinct piping sounds detected signifying potential queen loss or replacement."
                        .into(),
                risk: "Reproduction cycle interruption.".into(),
            });
        }

        self.computed = true;
    }

    fn run_disease_prediction(&mut self) {
        self.disease_risks.clear();
        let temp = self.sensor_data.temperature;
        let humidity = self.sensor_data.humidity;
        let audio = &self.sensor_data.audio_anomaly;

        // Varroa risk
        let mut varroa_risk: f64 = 15.0;
        if audio == "ACOUSTIC_VARROA_PATTERN" {
            varroa_risk += 75.0;
        }
        if varroa_risk > 20.0 {
            self.disease_risks.push(DiseaseRisk {
                disease: "Varroa Mites".into(),
                probability: varroa_risk,
                confidence: "High".into(),
                expert_insight: "Acoustic monitoring indicates high frequency vibrations consistent with mite-induced stress.".into(),
            });
        }

        // Chalkbrood risk
        let mut chalkbrood_risk: f64 = 5.0;
        if humidity > 75.0 && temp < 32.0 {
            chalkbrood_risk += 45.0;
        }
        if chalkbrood_risk > 20.0 {
            self.disease_risks.push(DiseaseRisk {
                disease: "Chalkbrood".into(),
                probability: chalkbrood_risk,
                confidence: "Medium".into(),
                expert_insight: "High moisture and low thermal regulation are primary catalysts for fungal growth.".into(),
            });
        }

        self.computed = true;
    }
}
