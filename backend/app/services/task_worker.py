import asyncio
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
import uuid

from app.db.supabase_db import db_select, db_insert, db_update

class TaskChronoWorker:
    """
    Background worker that monitors the `tasks` table and automatically creates 
    follow-up tasks for completed items with `is_recurring: true`.
    """
    
    async def run_automation_cycle(self):
        """
        Runs one cycle of the recurrence worker: finding completed, recurring tasks 
        that haven't spawned their next iteration, and spawning them.
        """
        print("[Chrono-Worker] Running automation cycle...")
        
        # We need completed tasks that are recurring, active status, and haven't spawned a child
        filters = {
            "status": "completed",
            "is_recurring": True,
            "has_spawned_next": False,
            "recurrence_status": "active"
        }
        
        # Bypass RLS using service role token or backend equivalent if available, 
        # but the db gateway uses service role by default when no token is passed.
        try:
            tasks_to_process = await db_select('tasks', filters=filters)
            
            if not tasks_to_process or not isinstance(tasks_to_process, list):
                return {"processed": 0, "status": "success"}
                
            tasks_processed = 0
            for task in tasks_to_process:
                await self._process_task(task)
                tasks_processed += 1
                
            print(f"[Chrono-Worker] Processed {tasks_processed} recurring tasks.")
            return {"processed": tasks_processed, "status": "success"}
            
        except Exception as e:
            print(f"[Chrono-Worker] Error running cycle: {e}")
            return {"processed": 0, "status": "error", "error": str(e)}

    async def _process_task(self, task: Dict[str, Any]):
        """Process an individual completed recurring task to spawn the next one."""
        # Calculate new due date
        # Assuming completed_at exists from trigger, otherwise use now
        base_date_str = task.get('completed_at') or task.get('due_date') or datetime.now(timezone.utc).isoformat()
        if isinstance(base_date_str, str) and base_date_str.endswith('Z'):
            base_date_str = base_date_str[:-1] + '+00:00'
            
        try:
            base_date = datetime.fromisoformat(base_date_str)
        except Exception:
            base_date = datetime.now(timezone.utc)
            
        recurrence_days = task.get('recurrence_days') or 7
        next_due_date = base_date + timedelta(days=recurrence_days)
        
        # Create new task dict, carrying over relevant properties
        new_task = {
            "user_id": task.get("user_id"),
            "apiary_id": task.get("apiary_id"),
            "hive_id": task.get("hive_id"),
            "type": task.get("type"),
            "title": task.get("title"),
            "description": task.get("description"),
            "priority": task.get("priority", "Medium"),
            "due_date": next_due_date.isoformat(),
            "status": "pending",
            "is_completed": False,
            "is_recurring": True,
            "recurrence_days": recurrence_days,
            "parent_task_id": task.get("id"),
            "recurrence_status": "active"
        }
        
        try:
            # Note: ensure to keep original recurrence fields backward compatible
            # if UI still sends standard JSON recurrence.
            if task.get("recurrence"):
                new_task["recurrence"] = task.get("recurrence")
                
            # 1. Spawn next task
            res = await db_insert('tasks', new_task)
            
            # 2. Mark parent task as having spawned its child
            if res.get("success"):
                spawned_data = res.get("data")
                # Handle list response from representation
                spawned_task = spawned_data[0] if isinstance(spawned_data, list) and len(spawned_data) > 0 else spawned_data
                
                await db_update(
                    'tasks', 
                    data={"has_spawned_next": True}, 
                    filters={"id": task.get("id")}
                )
                
                # 3. Log the automation action
                await db_insert('automation_logs', {
                    "task_id": task.get("id"),
                    "action": "SPAWN_RECURRING_TASK",
                    "description": f"Automatically generated follow-up task due {next_due_date.date()}",
                    "severity": "info",
                    "metadata": {"spawned_task_id": spawned_task.get("id") if isinstance(spawned_task, dict) else None}
                })
                
        except Exception as e:
            await db_insert('automation_logs', {
                "task_id": task.get("id"),
                "action": "SPAWN_ERROR",
                "description": f"Failed to generate follow-up task: {str(e)}",
                "severity": "error"
            })

chrono_worker = TaskChronoWorker()
