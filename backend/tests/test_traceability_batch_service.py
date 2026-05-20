import pytest
from unittest.mock import AsyncMock, patch

from app.services import traceability_batch_service, traceability_service


@pytest.mark.asyncio
async def test_build_batch_view_preserves_verified_records_without_blockchain():
    batch = {
        "batch_code": "BEE-2026-01-0420",
        "status": "verified",
        "honey_type": "BeeYield Acacia",
        "harvest_date": "2026-01-09",
    }
    harvest = {
        "batch_code": "BEE-2026-01-0420",
        "harvest_date": "2026-01-09",
        "honey_type": "BeeYield Acacia",
        "is_verified": True,
    }

    with patch(
        "app.services.traceability_batch_service._build_blockchain_status",
        return_value={"overall": "unverified", "honeychain": {"verified": False}, "polygon": {"verified": False}},
    ):
        view = await traceability_batch_service.build_batch_view(batch, harvest, include_live_snapshots=False)

    assert view["status"] == "verified"
    assert view["verification_status"] == "verified"
    assert view["blockchain_verified"] is False


@pytest.mark.asyncio
async def test_get_public_batch_views_filters_timothy_deterministically():
    batch_rows = [
        {"batch_code": "BEE-2026-01-0420", "harvest_date": "2026-01-09"},
        {"batch_code": "BEE-2026-01-0419", "harvest_date": "2026-01-09"},
        {"batch_code": "BEE-2026-01-0418", "harvest_date": "2026-01-09"},
        {"batch_code": "BEE-2026-01-0999", "harvest_date": "2026-01-10"},
    ]
    harvest_rows = []
    rendered_views = {
        "BEE-2026-01-0420": {"batch_code": "BEE-2026-01-0420", "harvest_date": "2026-01-09", "beekeeper_name": "Timothy Nduva", "status": "verified"},
        "BEE-2026-01-0419": {"batch_code": "BEE-2026-01-0419", "harvest_date": "2026-01-09", "beekeeper_name": "Timothy Nduva", "status": "verified"},
        "BEE-2026-01-0418": {"batch_code": "BEE-2026-01-0418", "harvest_date": "2026-01-09", "beekeeper_name": "Timothy Nduva", "status": "verified"},
        "BEE-2026-01-0999": {"batch_code": "BEE-2026-01-0999", "harvest_date": "2026-01-10", "beekeeper_name": "Someone Else", "status": "verified"},
    }

    async def fake_select(table, **kwargs):
        if table == "harvests":
            return harvest_rows
        if table == "honey_batches":
            return batch_rows
        return []

    async def fake_build(batch_row, harvest_row, **kwargs):
        return rendered_views[(batch_row or harvest_row)["batch_code"]]

    with patch("app.services.traceability_batch_service.db_select", new=AsyncMock(side_effect=fake_select)), patch(
        "app.services.traceability_batch_service.build_batch_view",
        new=AsyncMock(side_effect=fake_build),
    ):
        views = await traceability_batch_service.get_public_batch_views(owner_name="Timothy Nduva", verified_only=True, limit=3)

    assert [view["batch_code"] for view in views] == [
        "BEE-2026-01-0420",
        "BEE-2026-01-0419",
        "BEE-2026-01-0418",
    ]


@pytest.mark.asyncio
async def test_sync_public_batch_from_harvest_upserts_full_batch_record():
    harvest = {
        "batch_code": "BTCH-BY-H001-ACA-260415",
        "harvest_date": "2026-04-15",
        "quantity_kg": 2,
        "honey_type": "Early Spring",
        "is_verified": True,
        "farmer_id": "farmer-1",
        "apiary_id": "apiary-1",
        "hive_id": "hive-1",
    }
    farmer = {"id": "farmer-1", "farmer_id": "BK-MKN-001", "name": "Timothy Nduva", "phone": "+254 712 345 678"}
    apiary = {"id": "apiary-1", "name": "BeeYield Apiary", "county": "Makueni", "region": "Kibwezi East", "latitude": -2.36, "longitude": 37.93}
    hive = {"id": "hive-1", "apiary_id": "apiary-1"}

    async def fake_select(table, filters=None, **kwargs):
        if table == "hives":
            return [hive]
        if table == "apiaries":
            return [apiary]
        if table == "farmers":
            return [farmer]
        if table == "honey_batches":
            return []
        return []

    with patch("app.services.traceability_batch_service.db_select", new=AsyncMock(side_effect=fake_select)), patch(
        "app.services.traceability_batch_service.db_upsert",
        new=AsyncMock(return_value={"success": True, "data": [{"batch_code": harvest["batch_code"]}]}),
    ) as mock_upsert, patch(
        "app.services.traceability_batch_service._build_blockchain_status",
        return_value={"overall": "unverified", "honeychain": {"verified": False}, "polygon": {"verified": False}},
    ):
        result = await traceability_batch_service.sync_public_batch_from_harvest(harvest)

    assert result == {"batch_code": harvest["batch_code"]}
    payload = mock_upsert.await_args.args[1]
    assert payload["batch_code"] == harvest["batch_code"]
    assert payload["farmer_name"] == "Timothy Nduva"
    assert payload["beekeeper_name"] == "Timothy Nduva"
    assert payload["apiary_name"] == "BeeYield Apiary"
    assert payload["status"] == "verified"


@pytest.mark.asyncio
async def test_trace_response_tolerates_sparse_timothy_apiary_data():
    view = {
        "batch_code": "BEE-2026-01-0420",
        "honey_type": "Acacia",
        "harvest_date": "2026-01-10",
        "verification_status": "verified",
        "blockchain_verified": False,
        "verification_url": "",
        "harvest": {
            "batch_code": "BEE-2026-01-0420",
            "harvest_date": "2026-01-10",
            "quantity_kg": 2,
        },
        "farmer": {"id": "farmer-1", "name": "Timothy Nduva"},
        "apiary": {
            "id": "apiary-1",
            "name": "Kibwezi Apiary",
            "environment_type": None,
            "flora_types": None,
        },
        "hive": {
            "id": "hive-1",
            "hive_code": "H-001",
            "apiary_id": "apiary-1",
            "hive_type": None,
            "bee_type": None,
        },
    }

    with patch(
        "app.services.traceability_service._get_impact_stats",
        new=AsyncMock(return_value={"total_honey_kg": "2"}),
    ):
        response = await traceability_service.TraceabilityService._build_trace_response(view)

    assert response.batch_code == "BEE-2026-01-0420"
    assert response.apiary is not None
    assert response.apiary.environment_type == "Traceability Apiary"
    assert response.hive is not None
    assert response.hive.hive_type == "Traceability Hive"
