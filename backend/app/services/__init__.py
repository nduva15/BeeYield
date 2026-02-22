"""
BeeYield Services
"""
# All core logic is in the honey_rust binary.
# Python services act as thin wrappers.

from .ai_assistant import Assistant, BeeYieldAI, AIQuery, AIContext, AIResponse
from .shop_service import update_status, update_order_status, calc_yield, set_order_paid
