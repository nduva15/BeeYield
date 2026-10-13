"""
Test Suite for CEBA AI Output Standardization (PRD Implementation)
Validates:
1. StandardizedDiagnosticResponse Pydantic schema validation (alert_level pattern, fields)
2. Markdown structural formatting for UI rendering (Alert banners, Telemetry Key-Value block, Numbered Rationale, Checkbox Action Plan)
3. Post-processing grammar linter & sanitizer (active voice, first letter capitalization, terminal period, conversational filler scrubbing)
4. Resilient 99.9% JSON parsing across diverse LLM outputs (pure JSON, markdown fenced blocks, rationale + JSON, unstructured fallback)
5. End-to-end route_and_execute integration returning StandardizedDiagnosticResponse and UI Markdown
"""

import pytest
from pydantic import ValidationError
from unittest.mock import patch, AsyncMock, MagicMock

from app.schemas.diagnostic import (
    StandardizedDiagnosticResponse,
    lint_action_step,
    lint_formatted_rationale,
    lint_primary_issue,
    remove_conversational_filler,
    post_process_and_lint_diagnostic,
    parse_and_standardize_diagnostic_output,
    extract_telemetry_snapshot_from_context,
)
from app.services.ceba_context_engine import (
    AccountContext,
    ActiveApiary,
    InlandWeatherNode,
    InHiveMetrics,
    QueriedHiveTelemetry,
    ScopedContextPayload,
)
from app.services.ceba_router import ComplexityRouter


@pytest.fixture
def mock_telemetry_context():
    """Provides standard mock telemetry context for testing."""
    return ScopedContextPayload(
        account_context=AccountContext(
            user_id="usr_test_99",
            tenant_id="tnt_kibwezi_test",
            user_name="Timothy Nduva",
            role="Apiary Manager"
        ),
        active_apiaries=[
            ActiveApiary(
                apiary_id="ap_01",
                apiary_name="East Ridge Apiary",
                hive_count=8,
                inland_weather_node=InlandWeatherNode(
                    node_id="wx_node_1",
                    temp_c=24.5,
                    humidity_pct=52.0,
                    barometric_press_hpa=1014.0,
                    bloom_status="Active Acacia Bloom"
                )
            )
        ],
        queried_hives_telemetry=[
            QueriedHiveTelemetry(
                hive_id="hive_101",
                hive_name="Hive Alpha-1",
                colony_vigour_score=88,
                in_hive_metrics=InHiveMetrics(
                    brood_temp_c=35.1,
                    humidity_pct=58.0,
                    weight_kg=42.5,
                    daily_weight_delta_kg=-1.2,
                    acoustic_frequency_hz=160.0,
                    pest_flag="Negative"
                )
            )
        ]
    )


# ==============================================================================
# 1. Pydantic Schema Validation Tests (PRD Section 4.2)
# ==============================================================================

def test_standardized_schema_valid():
    """Validates that a correctly formatted payload conforms to StandardizedDiagnosticResponse."""
    diag = StandardizedDiagnosticResponse(
        alert_level="WARNING",
        primary_issue="Elevated Brood Core Temperature",
        formatted_rationale="1. Brood temperature is 36.8°C exceeding normal thresholds.\n\n2. Ventilation fan activity is elevated.",
        action_plan=["Inspect the top ventilation screen.", "Ensure adequate water supply near apiary."],
        telemetry_snapshot={"Brood Temp": "36.8°C", "Weight Delta": "-0.5kg"}
    )
    assert diag.alert_level == "WARNING"
    assert diag.primary_issue == "Elevated Brood Core Temperature"
    assert len(diag.action_plan) == 2
    assert diag.action_plan[0].endswith(".")


def test_standardized_schema_rejects_invalid_alert_level():
    """Validates that alert_level only accepts INFO, WARNING, or CRITICAL."""
    with pytest.raises(ValidationError):
        StandardizedDiagnosticResponse(
            alert_level="DANGER",  # Invalid
            primary_issue="Colony Alert",
            formatted_rationale="1. Issue detected.",
            action_plan=["Check hive."],
            telemetry_snapshot={}
        )


def test_standardized_schema_case_insensitive_alert_level():
    """Alert level passed in lowercase should be normalized to uppercase."""
    diag = StandardizedDiagnosticResponse(
        alert_level="critical",
        primary_issue="Acute Thermal Shock",
        formatted_rationale="1. Extreme temperature spike detected.",
        action_plan=["Shade the hive immediately."],
        telemetry_snapshot={}
    )
    assert diag.alert_level == "CRITICAL"


# ==============================================================================
# 2. UI Markdown Formatting Tests (PRD Section 3.2)
# ==============================================================================

def test_ui_markdown_formatting_standard():
    """
    Verifies Section 3.2 table specifications:
    - Alert Banner: [CRITICAL], [WARNING], [INFO]
    - Telemetry Summary: Key-Value block (e.g. **Brood Temp:** 35.1°C | **Weight:** -1.2kg)
    - Diagnostic Rationale: Numbered List (1. ...)
    - Action Plan: Checkbox Bullet Points (- [ ])
    """
    diag = StandardizedDiagnosticResponse(
        alert_level="CRITICAL",
        primary_issue="Brood Fever Thermoregulation Failure",
        formatted_rationale="1. Brood temperature reached 38.2°C.\n\n2. Colony acoustic frequency rose to 280 Hz indicating queen distress.",
        action_plan=[
            "Inspect the brood box for emergency queen cells.",
            "Install an upper ventilation rim.",
        ],
        telemetry_snapshot={
            "Brood Temp": "38.2°C",
            "Weight": "-1.2kg"
        }
    )

    md = diag.to_markdown()

    # Alert banner
    assert "[CRITICAL] **Brood Fever Thermoregulation Failure**" in md

    # Telemetry summary
    assert "### Telemetry Summary" in md
    assert "**Brood Temp:** 38.2°C | **Weight:** -1.2kg" in md

    # Diagnostic rationale
    assert "### Diagnostic Rationale" in md
    assert "1. Brood temperature reached 38.2°C." in md
    assert "2. Colony acoustic frequency rose to 280 Hz indicating queen distress." in md

    # Action plan
    assert "### Action Plan" in md
    assert "- [ ] Inspect the brood box for emergency queen cells." in md
    assert "- [ ] Install an upper ventilation rim." in md


# ==============================================================================
# 3. Post-Processing Grammar Linter Tests (PRD Section 3.1 & 4.3)
# ==============================================================================

def test_linter_action_steps_active_voice_and_capitalization():
    """Tests action item capitalization, terminal period, and removal of passive filler."""
    # Passive / colloquial input
    step1 = "you should inspect the brood chamber for queen cups"
    step2 = "it is recommended to add 2L of 1:1 sugar syrup"
    step3 = "please make sure to check hive ventilation"

    assert lint_action_step(step1) == "Inspect the brood chamber for queen cups."
    assert lint_action_step(step2) == "Add 2L of 1:1 sugar syrup."
    assert lint_action_step(step3) == "Check hive ventilation."


def test_linter_strips_existing_checkbox_markers():
    """Tests that if a model emits '- [ ] Step' or '* Step', the linter cleans it."""
    step = "- [ ] check varroa mite count on bottom sticky board"
    assert lint_action_step(step) == "Check varroa mite count on bottom sticky board."


def test_linter_rationale_numbered_list_enforcement():
    """Tests that bullet points or paragraphs are converted into numbered markdown list."""
    unstructured_rationale = (
        "Here is the diagnostic data:\n"
        "- elevated brood temperature indicates cluster thermoregulation stress\n"
        "- daily weight drop of 1.2kg suggests swarming departure"
    )
    linted = lint_formatted_rationale(unstructured_rationale)
    assert linted.startswith("1. Elevated brood temperature indicates cluster thermoregulation stress.")
    assert "2. Daily weight drop of 1.2kg suggests swarming departure." in linted
    assert "Here is the diagnostic data" not in linted


def test_linter_primary_issue_cleanup():
    """Tests that titles are concise, title-cased, and without prefixes or trailing periods."""
    raw_title = "Primary Issue: hive alpha-1 brood overheating alert."
    cleaned = lint_primary_issue(raw_title)
    assert cleaned == "Hive Alpha-1 Brood Overheating Alert"
    assert not cleaned.endswith(".")


def test_conversational_filler_scrubbing():
    """Validates removal of conversational preamble prohibited by Section 3.1."""
    text1 = "I think that the colony is exhibiting queenlessness signs."
    text2 = "As an AI model, based on the telemetry data, weight is dropping."
    assert remove_conversational_filler(text1) == "the colony is exhibiting queenlessness signs."
    assert remove_conversational_filler(text2) == "weight is dropping."


# ==============================================================================
# 4. Resilient 99.9% Output Parsing Tests (PRD Section 5 Success Metric 1)
# ==============================================================================

def test_parse_pure_json_payload(mock_telemetry_context):
    """Parses pure JSON string."""
    payload = """{
        "alert_level": "WARNING",
        "primary_issue": "Moderate Colony Weight Loss",
        "formatted_rationale": "1. Telemetry records 1.2kg loss over 24 hours.\\n\\n2. Forager flight activity remains moderate.",
        "action_plan": [
            "Inspect super frames for nectar depletion.",
            "Verify presence of healthy laying queen."
        ],
        "telemetry_snapshot": {
            "Brood Temp": "35.1°C",
            "Weight Delta": "-1.2kg"
        }
    }"""
    parsed = parse_and_standardize_diagnostic_output(payload, mock_telemetry_context)
    assert parsed.alert_level == "WARNING"
    assert parsed.primary_issue == "Moderate Colony Weight Loss"
    assert len(parsed.action_plan) == 2
    assert parsed.action_plan[0] == "Inspect super frames for nectar depletion."


def test_parse_markdown_fenced_json(mock_telemetry_context):
    """Parses JSON inside markdown fenced blocks ```json ... ```."""
    payload = """Here is the analysis:
```json
{
    "alert_level": "CRITICAL",
    "primary_issue": "Acute Chilled Brood Risk",
    "formatted_rationale": "1. Brood temperature dropped below 32°C.\\n\\n2. Outside ambient temperature is 8°C.",
    "action_plan": [
        "Seal upper entrance to conserve cluster heat.",
        "Refrain from opening brood chamber until ambient exceeds 12°C."
    ]
}
```"""
    parsed = parse_and_standardize_diagnostic_output(payload, mock_telemetry_context)
    assert parsed.alert_level == "CRITICAL"
    assert "Acute Chilled Brood Risk" in parsed.primary_issue
    assert len(parsed.action_plan) == 2
    assert "Brood Temp" in parsed.telemetry_snapshot


def test_parse_diagnostic_reasoning_followed_by_json(mock_telemetry_context):
    """
    Parses Modelfile pattern where diagnostic reasoning is emitted first,
    followed by the JSON block.
    """
    payload = """Diagnostic Reasoning:
1. Brood temperature is stable at 35.1°C across central cluster frames.
2. Weight delta indicates -1.2kg net reduction consistent with swarming.

{
    "alert_level": "WARNING",
    "primary_issue": "Potential Swarm Departure Event",
    "action_plan": [
        "Check tree canopy near apiary for clustered swarm.",
        "Inspect brood box for swarm cells."
    ]
}"""
    parsed = parse_and_standardize_diagnostic_output(payload, mock_telemetry_context)
    assert parsed.alert_level == "WARNING"
    assert "Potential Swarm Departure Event" in parsed.primary_issue
    assert "1. Brood temperature is stable" in parsed.formatted_rationale


def test_parse_raw_unstructured_text_fallback(mock_telemetry_context):
    """
    Verifies that even if the student model emits completely unformatted plain text,
    the parser synthesizes a valid StandardizedDiagnosticResponse without raising exceptions.
    """
    raw_text = (
        "CEBA AI Student: Current brood temperature is 34.8°C across active hives. "
        "Colony is performing normally with steady weight dynamics."
    )
    parsed = parse_and_standardize_diagnostic_output(
        raw_text,
        mock_telemetry_context,
        query="What is the current brood temperature?"
    )
    assert parsed.alert_level == "INFO"
    assert parsed.primary_issue != ""
    assert parsed.formatted_rationale.startswith("1.")
    assert len(parsed.action_plan) >= 1
    assert parsed.action_plan[0].endswith(".")
    assert "Brood Temp" in parsed.telemetry_snapshot


# ==============================================================================
# 5. End-to-End Route and Execute Integration Tests
# ==============================================================================

@pytest.mark.asyncio
async def test_route_and_execute_returns_standardized_response_for_student(mock_telemetry_context):
    """
    Tests that ComplexityRouter.route_and_execute returns:
    1. 'standardized_response': StandardizedDiagnosticResponse dict
    2. 'response': Rich Markdown formatted string
    3. Proper student model identifier
    """
    mock_student_raw = """{
        "alert_level": "INFO",
        "primary_issue": "Nominal Brood Thermoregulation",
        "formatted_rationale": "1. Brood temperature is 35.1°C, within the optimal range of 34.5°C to 35.5°C.\\n\\n2. Humidity at 58% indicates stable nest climate.",
        "action_plan": [
            "Maintain regular 7-10 day inspection schedule.",
            "Monitor entrance activity during peak foraging hours."
        ],
        "telemetry_snapshot": {
            "Brood Temp": "35.1°C",
            "Weight": "42.5kg"
        }
    }"""

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"response": mock_student_raw}

    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=mock_resp)):
        router = ComplexityRouter()
        result = await router.route_and_execute("What is the brood temperature in Hive Alpha-1?", mock_telemetry_context)

        assert result["decision"] == "STUDENT"
        assert "standardized_response" in result
        std_dict = result["standardized_response"]
        assert std_dict["alert_level"] == "INFO"
        assert std_dict["primary_issue"] == "Nominal Brood Thermoregulation"
        assert len(std_dict["action_plan"]) == 2

        # Check UI Markdown format
        ui_md = result["response"]
        assert "[INFO]" in ui_md
        assert "### Telemetry Summary" in ui_md
        assert "### Diagnostic Rationale" in ui_md
        assert "### Action Plan" in ui_md
        assert "- [ ]" in ui_md


@pytest.mark.asyncio
async def test_route_and_execute_returns_standardized_response_for_teacher(mock_telemetry_context):
    """
    Tests that complex biosecurity escalation returns standardized output from Teacher.
    """
    mock_teacher_raw = """{
        "alert_level": "CRITICAL",
        "primary_issue": "American Foulbrood Biosecurity Breach",
        "formatted_rationale": "1. Clinical symptoms match Paenibacillus larvae infection.\\n\\n2. High spore persistence poses immediate risk to neighboring apiaries.",
        "action_plan": [
            "Quarantine infected colony immediately with hive entrance restrictor.",
            "Notify county apiary inspector for official laboratory diagnosis.",
            "Do not transfer frames or equipment to healthy hives."
        ],
        "telemetry_snapshot": {
            "Pathogen Risk": "American Foulbrood (AFB)",
            "Apiary Status": "Quarantine Recommended"
        }
    }"""

    with patch("app.services.ceba_router.execute_ceba_ai_engine", new=AsyncMock(return_value=mock_teacher_raw)):
        router = ComplexityRouter()
        result = await router.route_and_execute(
            "I suspect American Foulbrood in my colony. What are the symptoms?",
            mock_telemetry_context
        )

        assert result["decision"] == "TEACHER"
        assert "standardized_response" in result
        std_dict = result["standardized_response"]
        assert std_dict["alert_level"] == "CRITICAL"
        assert "American Foulbrood" in std_dict["primary_issue"]

        ui_md = result["response"]
        assert "[CRITICAL]" in ui_md
        assert "- [ ] Quarantine infected colony immediately" in ui_md
