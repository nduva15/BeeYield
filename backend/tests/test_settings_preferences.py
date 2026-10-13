"""
Test Suite for User Settings & Preferences (Temperature & Unit System Updates)
Verifies:
1. PUT /settings/preferences accepts unit_system ('Imperial', 'Metric', 'celsius', 'fahrenheit')
2. PUT /settings/profile normalizes unit_system to enum-compatible string
3. Pydantic schema UserPreferencesUpdate validation
"""

import pytest
from unittest.mock import patch, AsyncMock
from app.schemas.user_settings import UserPreferencesUpdate


def test_user_preferences_update_schema_accepts_units():
    """Validates that UserPreferencesUpdate accepts unit_system, temp_unit, and other fields."""
    update = UserPreferencesUpdate(
        unit_system="Imperial",
        temp_unit="fahrenheit",
        weight_unit="lbs",
        language="EN",
        theme="dark"
    )
    dumped = update.model_dump(exclude_unset=True)
    assert dumped["unit_system"] == "Imperial"
    assert dumped["temp_unit"] == "fahrenheit"
    assert dumped["weight_unit"] == "lbs"
    assert dumped["language"] == "EN"
    assert dumped["theme"] == "dark"


def test_user_preferences_update_empty_dump():
    """Empty model dump should be empty dict."""
    update = UserPreferencesUpdate()
    assert update.model_dump(exclude_unset=True) == {}


@pytest.mark.asyncio
async def test_update_preferences_celsius_to_fahrenheit():
    """Tests updating preferences from celsius to fahrenheit."""
    from app.api.api_v1.endpoints.settings import update_preferences

    mock_db_update = AsyncMock(return_value={"success": True, "data": [{"unit_system": "imperial"}]})
    mock_db_select = AsyncMock(return_value=[])
    mock_db_insert = AsyncMock(return_value={"success": True, "data": [{"unit_system": "imperial"}]})

    with patch("app.api.api_v1.endpoints.settings.db_update", mock_db_update), \
         patch("app.api.api_v1.endpoints.settings.db_select", mock_db_select), \
         patch("app.api.api_v1.endpoints.settings.db_insert", mock_db_insert):

        # Test changing to Fahrenheit (Imperial)
        payload = UserPreferencesUpdate(unit_system="Imperial", temp_unit="fahrenheit")
        result = await update_preferences(data=payload, user_id="usr_test_123", token=None)

        assert result["message"] == "Preferences updated"
        assert "data" in result
        # Verify db_update or db_insert was called with unit_system = 'imperial'
        called_with_imperial = any(
            call.args[1].get("unit_system") == "imperial"
            for call in mock_db_update.call_args_list + mock_db_insert.call_args_list
            if len(call.args) > 1 and isinstance(call.args[1], dict)
        )
        assert called_with_imperial


@pytest.mark.asyncio
async def test_update_preferences_fahrenheit_to_celsius():
    """Tests updating preferences from fahrenheit to celsius."""
    from app.api.api_v1.endpoints.settings import update_preferences

    mock_db_update = AsyncMock(return_value={"success": True, "data": [{"unit_system": "metric"}]})
    mock_db_select = AsyncMock(return_value=[])
    mock_db_insert = AsyncMock(return_value={"success": True, "data": [{"unit_system": "metric"}]})

    with patch("app.api.api_v1.endpoints.settings.db_update", mock_db_update), \
         patch("app.api.api_v1.endpoints.settings.db_select", mock_db_select), \
         patch("app.api.api_v1.endpoints.settings.db_insert", mock_db_insert):

        # Test changing to Celsius (Metric)
        payload = UserPreferencesUpdate(unit_system="Metric", temp_unit="celsius")
        result = await update_preferences(data=payload, user_id="usr_test_123", token=None)

        assert result["message"] == "Preferences updated"
        assert "data" in result
        called_with_metric = any(
            call.args[1].get("unit_system") == "metric"
            for call in mock_db_update.call_args_list + mock_db_insert.call_args_list
            if len(call.args) > 1 and isinstance(call.args[1], dict)
        )
        assert called_with_metric
