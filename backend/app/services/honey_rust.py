"""
Honey Rust Bridge
=================
Connects the Python service layer to the high-performance beeyield_core Rust engine.
"""

try:
    # Try to import from the compiled Rust extension
    from beeyield_core import BeeYieldAI as RustBeeYieldAI
    _RUST_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    _RUST_AVAILABLE = False
    class RustBeeYieldAI:
        """Fallback Python implementation of the BeeYieldAI Rust class."""
        def __init__(self):
            print("WARNING: beeyield_core rust extension not found. Using slow Python fallback.")
            self.intents = {
                "product_search": ["buy", "purchase", "order", "shop", "honey", "price", "cost", "available", "stock", "store"],
                "order_status": ["order", "tracking", "delivery", "shipment", "status", "where is my"],
                "trace_honey": ["trace", "origin", "source", "batch", "verify", "authenticate", "qr", "honeychain"],
                "iot_data": ["sensor", "temperature", "humidity", "weight", "telemetry", "iot", "monitoring", "data"],
                "hive_health": ["health", "disease", "sick", "varroa", "mite", "infection", "anomaly", "symptom", "treatment"],
                "greeting": ["hello", "hi", "hey", "jambo", "habari"],
                "harvest_logs": ["harvest", "yield", "production", "bottles", "jars", "collected"]
            }

        def detect_intents(self, message: str) -> list:
            msg = message.lower()
            detected = [k for k, keywords in self.intents.items() if any(kw in msg for kw in keywords)]
            return detected if detected else ["general"]

        def get_temperature(self, intents: list) -> float:
            creative = {"greeting"}
            factual = {"trace_honey", "order_status", "iot_data", "product_search", "harvest_logs"}
            if any(i in creative for i in intents): return 0.7
            if any(i in factual for i in intents): return 0.1
            return 0.4

        def build_system_prompt(self, language, user_role, user_name, intents, context_data) -> str:
            name_str = f" named {user_name}" if user_name else ""
            return f"ROLE: BeeYield AI. LANG: {language}. USER: {user_role}{name_str}. INTENTS: {', '.join(intents)}. CONTEXT: {context_data}"

        def format_response(self, text: str) -> str:
            return text.strip().replace("HoneyBee Corp", "BeeYield")

# Singleton instance of the engine
BeeYieldAI = RustBeeYieldAI
