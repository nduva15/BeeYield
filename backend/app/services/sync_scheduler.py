"""
KNOWLEDGE SYNC SCHEDULER (v4.0)
Runs metadata_standardizer.py every 12 hours.
"""
import asyncio
import subprocess
import sys
import os
from datetime import datetime, timedelta
from typing import Optional

class KnowledgeSyncScheduler:
    """
    Background scheduler for knowledge lakehouse synchronization.
    """
    
    _task: Optional[asyncio.Task] = None
    _last_sync: Optional[datetime] = None
    _sync_interval_hours: int = 12
    _is_running: bool = False

    @classmethod
    async def start(cls, interval_hours: int = 12):
        """Start the background sync scheduler."""
        if cls._is_running:
            return {"status": "already_running"}
        
        cls._sync_interval_hours = interval_hours
        cls._is_running = True
        cls._task = asyncio.create_task(cls._sync_loop())
        
        print(f"[SCHEDULER] Knowledge sync started. Interval: {interval_hours}h")
        return {"status": "started", "interval_hours": interval_hours}

    @classmethod
    async def stop(cls):
        """Stop the background sync scheduler."""
        if cls._task:
            cls._task.cancel()
            try:
                await cls._task
            except asyncio.CancelledError:
                pass
        cls._is_running = False
        print("[SCHEDULER] Knowledge sync stopped.")
        return {"status": "stopped"}

    @classmethod
    async def _sync_loop(cls):
        """Main sync loop - runs indefinitely."""
        # Delay first sync by 5 minutes to let the server warm up first
        await asyncio.sleep(300)
        
        while cls._is_running:
            try:
                await cls.run_sync()
            except Exception as e:
                print(f"[SCHEDULER] Sync error: {e}")
            
            # Wait for next interval
            await asyncio.sleep(cls._sync_interval_hours * 3600)

    @classmethod
    async def run_sync(cls) -> dict:
        """
        Execute the metadata standardizer and vector store rebuild.
        """
        print(f"[SCHEDULER] Starting knowledge sync at {datetime.now().isoformat()}")
        
        results = {
            "started_at": datetime.now().isoformat(),
            "steps": []
        }
        
        # Step 1: Run metadata standardizer
        try:
            script_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "../../scripts/metadata_standardizer.py")
            )
            
            # Run the standardizer script
            process = await asyncio.create_subprocess_exec(
                sys.executable, script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=os.path.dirname(script_path)
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                results["steps"].append({
                    "step": "metadata_standardizer",
                    "status": "success",
                    "output": stdout.decode()[-500:]  # Last 500 chars
                })
            else:
                results["steps"].append({
                    "step": "metadata_standardizer",
                    "status": "error",
                    "error": stderr.decode()[-500:]
                })
        except Exception as e:
            results["steps"].append({
                "step": "metadata_standardizer",
                "status": "error",
                "error": str(e)
            })

        # Step 2: Rebuild vector store
        try:
            from app.services.vector_store import QdrantVectorStore
            init_result = await QdrantVectorStore.initialize(force_rebuild=True)
            results["steps"].append({
                "step": "vector_store_rebuild",
                "status": "success" if init_result.get("status") == "success" else "error",
                "details": init_result
            })
        except Exception as e:
            results["steps"].append({
                "step": "vector_store_rebuild",
                "status": "skipped",
                "reason": str(e)
            })

        cls._last_sync = datetime.now()
        results["completed_at"] = datetime.now().isoformat()
        
        print(f"[SCHEDULER] Sync completed: {results}")
        return results

    @classmethod
    def get_status(cls) -> dict:
        """Get scheduler status."""
        return {
            "is_running": cls._is_running,
            "interval_hours": cls._sync_interval_hours,
            "last_sync": cls._last_sync.isoformat() if cls._last_sync else None,
            "next_sync": (cls._last_sync + timedelta(hours=cls._sync_interval_hours)).isoformat() 
                         if cls._last_sync else "pending"
        }
