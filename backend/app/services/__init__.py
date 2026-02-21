"""
BeeYield Services Package
"""
# Delayed imports to avoid circular dependencies
def get_beeyield_ai():
    from .ai_assistant import BeeYieldAI
    return BeeYieldAI

# Explicitly export common services
try:
    from .ai_assistant import BeeYieldAI, AIQuery, AIContext, AIResponse
except ImportError:
    pass

try:
    from .shop_service import update_order_status
except ImportError:
    pass
