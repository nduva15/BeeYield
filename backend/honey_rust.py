"""
Redirect module to handle direct legacy imports of `honey_rust`.
This ensures that `from honey_rust import ...` works transparently
even if `beeyield_core` has not been imported yet.
"""

import sys
import beeyield_core

# Re-export all public attributes from beeyield_core
HiveHealthEngine = beeyield_core.HiveHealthEngine
MetadataEngine = beeyield_core.MetadataEngine
RateLimiter = beeyield_core.RateLimiter
HarvestBatcher = beeyield_core.HarvestBatcher
ImageEngine = beeyield_core.ImageEngine
AcousticEngine = beeyield_core.AcousticEngine
PollinationEngine = beeyield_core.PollinationEngine
TraceabilityEngine = beeyield_core.TraceabilityEngine
IngestionEngine = beeyield_core.IngestionEngine
SearchEngine = beeyield_core.SearchEngine
ShopEngine = beeyield_core.ShopEngine
Assistant = beeyield_core.Assistant
IntentDetector = beeyield_core.IntentDetector
MpesaEngine = beeyield_core.MpesaEngine
InvoicingEngine = beeyield_core.InvoicingEngine
DashboardEngine = beeyield_core.DashboardEngine
AdminDashboardEngine = beeyield_core.AdminDashboardEngine
rust_update_order_status = beeyield_core.rust_update_order_status
calc_yield = beeyield_core.calc_yield
__version__ = getattr(beeyield_core, "__version__", "1.0.0")

sys.modules["honey_rust"] = sys.modules[__name__]
