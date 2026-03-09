"""
Intelligence Hub Service
========================
The "Company Brain" for BeeYield AI.
Aggregates user-specific data into high-fidelity context for the LLM.
"""
from typing import List, Dict, Any, Optional
from app.db.supabase_db import db_select, db_rpc, db_insert
from datetime import datetime, timedelta

class IntelligenceHub:
    @staticmethod
    async def get_user_snapshot(user_id: str, token: Optional[str] = None) -> str:
        """
        Gathers a comprehensive text summary of the user's beekeeping status.
        Used as system context for the BeeYield AI.
        """
        # 1. Fetch Apiaries & Hives
        apiaries = await db_select("apiaries", filters={"user_id": user_id}, token=token)
        hives = await db_select("hives", filters={"user_id": user_id}, token=token)
        
        # 2. Latest Inspections (last 14 days)
        fourteen_days_ago = (datetime.now() - timedelta(days=14)).date().isoformat()
        inspections = await db_select(
            "inspections", 
            filters={"user_id": user_id}, 
            order_by="inspection_date", 
            ascending=False, 
            limit=5, 
            token=token
        )
        
        # 3. Recent Harvests (last 30 days)
        harvests = await db_select(
            "harvests",
            filters={"user_id": user_id},
            order_by="harvest_date",
            ascending=False,
            limit=5,
            token=token
        )
        
        # 4. Critical Alerts (from disease_detections or IoT)
        alerts = await db_select(
            "disease_detections",
            filters={"user_id": user_id},
            order_by="detected_at",
            ascending=False,
            limit=3,
            token=token
        )

        # Build Context String
        ctx = "[AUTHORITATIVE USER CONTEXT]\n"
        ctx += f"User ID: {user_id}\n"
        ctx += f"Current Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        
        ctx += "--- APIARIES & HIVES ---\n"
        if apiaries:
            for a in apiaries:
                a_hives = [h for h in hives if str(h.get("apiary_id")) == str(a.get("id"))]
                ctx += f"- Apiary: {a.get('name')} ({a.get('location_name', 'Unknown')})\n"
                ctx += f"  Status: {a.get('status')} | Hives: {len(a_hives)}\n"
        else:
            ctx += "No registered apiaries found.\n"
            
        ctx += "\n--- RECENT ACTIVITY ---\n"
        if inspections:
            ctx += "Latest Inspections:\n"
            for i in inspections:
                ctx += f"- {i.get('inspection_date')}: Hive {i.get('hive_id')} - Diagnosis: {i.get('diagnosis') or 'Normal'}\n"
        
        if harvests:
            ctx += "\nRecent Harvests:\n"
            for h in harvests:
                ctx += f"- {h.get('harvest_date')}: {h.get('quantity_kg')}kg of {h.get('honey_type')}\n"

        if alerts:
            ctx += "\n--- ACTIVE ALERTS ---\n"
            for al in alerts:
                ctx += f"!!! ALERT: {al.get('disease_name')} detected on {al.get('detected_at')}. Confidence: {al.get('confidence_score')}\n"
        
        ctx += "\n[END CONTEXT]"
        return ctx

    @staticmethod
    async def execute_ai_action(action_type: str, params: Dict[str, Any], user_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a transactional action based on AI intent.
        """
        if action_type == "schedule_inspection":
            # Logic to create a task for inspection
            from app.api.api_v1.endpoints.beeyield import TaskCreate
            task_data = {
                "title": f"AI Suggested Inspection: {params.get('reason', 'General Check')}",
                "description": f"Triggered by BeeYield AI based on: {params.get('context', 'User query')}",
                "priority": params.get("priority", "medium"),
                "category": "Inspection",
                "apiary_id": params.get("apiary_id"),
                "hive_id": params.get("hive_id"),
                "due_date": (datetime.now() + timedelta(days=2)).isoformat()
            }
            res = await db_select("tasks", filters={"user_id": user_id, "title": task_data["title"]}, token=token) # check dupe
            if not res:
                task_data["user_id"] = user_id
                await db_insert("tasks", task_data, token=token)
                return {"success": True, "message": "Inspection task scheduled."}
            return {"success": True, "message": "Task already exists."}
            
        return {"success": False, "error": f"Unknown action type: {action_type}"}
