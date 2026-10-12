"""
Test Suite for CEBA AI Knowledge Distillation & Complexity Routing Architecture
Validates:
1. Stage 3 Biosecurity & Agronomic Rules Engine (miticides in honey flow, cold inspections)
2. Stage 5 ComplexityRouter decision boundaries (Student vs. Teacher)
3. End-to-end route_and_execute dispatch with fallback resilience
"""

import pytest
from unittest.mock import patch, AsyncMock

from app.services.ceba_context_engine import (
    AccountContext,
    ActiveApiary,
    InlandWeatherNode,
    InHiveMetrics,
    QueriedHiveTelemetry,
    ScopedContextPayload,
)
from app.services.ceba_router import ComplexityRouter
from scripts.filter_distillation_dataset import BiosecurityRulesEngine


@pytest.fixture
def base_context():
    """Returns a baseline nominal tenant context."""
    return ScopedContextPayload(
        account_context=AccountContext(
            user_id="usr_test_123",
            tenant_id="tnt_kibwezi_farm",
            user_name="Timothy Mathuva",
            role="Owner"
        ),
        active_apiaries=[
            ActiveApiary(
                apiary_id="ap_01",
                apiary_name="Kibwezi North Apiary",
                hive_count=10,
                inland_weather_node=InlandWeatherNode(
                    node_id="wx_node_1",
                    temp_c=25.0,
                    humidity_pct=50.0,
                    barometric_press_hpa=1013.2,
                    bloom_status="Active Macadamia Bloom"
                )
            )
        ],
        queried_hives_telemetry=[
            QueriedHiveTelemetry(
                hive_id="hive_101",
                hive_name="Hive Alpha-1",
                colony_vigour_score=92,
                in_hive_metrics=InHiveMetrics(
                    brood_temp_c=35.0,
                    humidity_pct=55.0,
                    weight_kg=45.0,
                    daily_weight_delta_kg=0.3,
                    acoustic_frequency_hz=145.0,
                    pest_flag="Negative"
                )
            )
        ]
    )


# ==============================================================================
# 1. ComplexityRouter Decision Unit Tests
# ==============================================================================

def test_router_nominal_routes_to_student(base_context):
    """Routine status questions with normal metrics must route to 8B Student."""
    router = ComplexityRouter()
    decision = router.assess_complexity(base_context, "What is the brood temperature in Hive Alpha-1?")
    assert decision.target == "STUDENT"
    assert "nominal" in decision.reason.lower()


def test_router_semantic_trigger_routes_to_teacher(base_context):
    """Questions with high-risk pathology keywords must escalate to Teacher."""
    router = ComplexityRouter()
    decision = router.assess_complexity(base_context, "I suspect American Foulbrood in my colony. What are the symptoms?")
    assert decision.target == "TEACHER"
    assert "foulbrood" in decision.reason.lower()


def test_router_critical_brood_temp_routes_to_teacher(base_context):
    """Brood temperature exceeding 37.0°C or below 32.0°C must trigger Teacher."""
    router = ComplexityRouter()
    # Simulate acute heat fever
    base_context.queried_hives_telemetry[0].in_hive_metrics.brood_temp_c = 38.5
    decision = router.assess_complexity(base_context, "How is the colony performing today?")
    assert decision.target == "TEACHER"
    assert "Critical" in decision.reason or "Multiple" in decision.reason


def test_router_swarming_multianomaly_routes_to_teacher(base_context):
    """Simultaneous steep weight loss and acoustic spike must route to Teacher."""
    router = ComplexityRouter()
    base_context.queried_hives_telemetry[0].in_hive_metrics.daily_weight_delta_kg = -1.5
    base_context.queried_hives_telemetry[0].in_hive_metrics.acoustic_frequency_hz = 285.0
    decision = router.assess_complexity(base_context, "Check colony stability.")
    assert decision.target == "TEACHER"
    assert len(decision.anomaly_flags) >= 2


def test_router_cold_ambient_inspection_routes_to_teacher(base_context):
    """Inspection requests when ambient temperature is below 12°C must route to Teacher."""
    router = ComplexityRouter()
    base_context.active_apiaries[0].inland_weather_node.temp_c = 8.5
    decision = router.assess_complexity(base_context, "Should I open the hive and inspect brood frames today?")
    assert decision.target == "TEACHER"
    assert any("cold ambient" in a.lower() for a in decision.anomaly_flags)


# ==============================================================================
# 2. Biosecurity Rules Engine Unit Tests
# ==============================================================================

def test_biosecurity_rejects_miticide_during_honey_flow():
    """Rules engine must reject synthetic records prescribing chemical miticides in honey flow."""
    engine = BiosecurityRulesEngine()
    invalid_sample = {
        "scenario_id": "test_invalid_flow",
        "input": '{"honey_flow": true, "ambient_temp_c": 22.0}',
        "query": "How to treat varroa now?",
        "teacher_reasoning": "Varroa is high, so treat immediately with Amitraz strips in the brood nest.",
        "final_response": {
            "alert_level": "WARNING",
            "primary_issue": "Varroa Infestation",
            "action_plan": [
                "Insert Amitraz (Apivar) strips between brood frames",
                "Leave strips for 6 weeks"
            ]
        }
    }
    is_valid, reason = engine.validate_sample(invalid_sample)
    assert not is_valid
    assert "Biosecurity Violation" in reason
    assert "amitraz" in reason.lower()


def test_biosecurity_approves_organic_miticide_or_deferral_during_flow():
    """Organic flow-safe treatments or non-chemical deferrals must pass."""
    engine = BiosecurityRulesEngine()
    valid_sample = {
        "scenario_id": "test_valid_flow",
        "input": '{"honey_flow": true, "ambient_temp_c": 22.0}',
        "query": "How to treat varroa now?",
        "teacher_reasoning": "During active honey flow, synthetic miticides like Amitraz are prohibited to avoid honey contamination. Use Formic Pro or physical drone comb culling.",
        "final_response": {
            "alert_level": "WARNING",
            "primary_issue": "Varroa Infestation During Honey Flow",
            "action_plan": [
                "Strictly avoid synthetic chemical miticides during active nectar flow",
                "Apply flow-approved Formic Pro pads or remove capped drone frames"
            ]
        }
    }
    is_valid, reason = engine.validate_sample(valid_sample)
    assert is_valid
    assert reason == "PASSED"


def test_biosecurity_rejects_cold_weather_inspection():
    """Rules engine must reject opening hive frames when ambient temperature is below 12°C."""
    engine = BiosecurityRulesEngine()
    invalid_cold = {
        "scenario_id": "test_invalid_cold",
        "input": '{"ambient_temp_c": 9.0, "brood_temp_c": 30.0}',
        "query": "Should I inspect frames?",
        "teacher_reasoning": "The brood is cool, so you should check on the queen.",
        "final_response": {
            "alert_level": "WARNING",
            "primary_issue": "Cold Brood",
            "action_plan": [
                "Open the hive immediately to inspect frames for cluster size"
            ]
        }
    }
    is_valid, reason = engine.validate_sample(invalid_cold)
    assert not is_valid
    assert "Agronomic Violation" in reason
    assert "<12°C" in reason


# ==============================================================================
# 3. End-to-End Route and Execute Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_route_and_execute_student_flow(base_context):
    """Verifies route_and_execute handles student requests and returns proper structure."""
    router = ComplexityRouter()
    with patch.object(router, "execute_student", new=AsyncMock(return_value="CEBA AI Student: Current brood temperature is 34.8°C across active hives.")):
        result = await router.route_and_execute("What is the current brood temperature?", base_context)
        assert result["decision"] == "STUDENT"
        assert "student" in result["model"].lower()
        assert result["latency_ms"] >= 0
        assert "CEBA AI" in result["response"]
        assert "brood temperature" in result["response"].lower()
