from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Optional
from pydantic import BaseModel
from app.core import security
from app.db.supabase_db import db_select
import networkx as nx
import math

router = APIRouter()

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

class StartPoint(BaseModel):
    lat: float
    lng: float

class RoutePlanRequest(BaseModel):
    start_point: StartPoint
    selected_hive_ids: List[str]

@router.post("/plan")
async def plan_route(
    request_data: RoutePlanRequest,
    current_user: dict = Depends(security.get_current_user),
    token: Optional[str] = Depends(get_token)
):
    """
    Economic Route Planner using Traveling Salesperson Problem (TSP) logic.
    Calculates the shortest optimal path between starting point and selected hives.
    """
    if not request_data.selected_hive_ids:
        return {"path": []}

    # Fetch hive details
    # We filter by user_id to ensure RLS-like behavior even if token is system-level
    user_id = current_user.get("sub")
    hives = await db_select("hives", filters={"id": request_data.selected_hive_ids, "user_id": user_id}, token=token)
    
    if not hives:
        # Try finding by farmer_id or shared apiaries if not direct owner
        hives = await db_select("hives", filters={"id": request_data.selected_hive_ids}, token=token)
        if not hives:
            raise HTTPException(status_code=404, detail="Selected hives not found")

    # Fetch apiaries in batch for coordinate fallback
    apiary_ids = list(set(str(h.get("apiary_id")) for h in hives if h.get("apiary_id")))
    apiaries_data = await db_select("apiaries", filters={"id": apiary_ids}, token=token) if apiary_ids else []
    apiaries_map = {str(a["id"]): a for a in apiaries_data if a.get("id")}

    # Build graph nodes from valid hives
    G = nx.Graph()
    G.add_node("start", pos=(request_data.start_point.lat, request_data.start_point.lng))
    
    valid_hives = []
    for hive in hives:
        # Try hive level coordinates first
        lat = hive.get("latitude")
        lng = hive.get("longitude")
        
        # Fallback to parent apiary coordinates if hive level is missing
        if (lat is None or lng is None) and hive.get("apiary_id"):
            apiary = apiaries_map.get(str(hive["apiary_id"]))
            if apiary:
                lat = apiary.get("latitude")
                lng = apiary.get("longitude")
        
        if lat is not None and lng is not None:
            try:
                lat_f, lng_f = float(lat), float(lng)
                G.add_node(str(hive["id"]), pos=(lat_f, lng_f))
                valid_hives.append(hive)
            except (ValueError, TypeError):
                continue
            
    if not valid_hives:
        raise HTTPException(status_code=400, detail="No hives with valid coordinates found for routing")

    # Add edges with Euclidean distance
    all_nodes = list(G.nodes)
    for i in range(len(all_nodes)):
        for j in range(i + 1, len(all_nodes)):
            n1 = all_nodes[i]
            n2 = all_nodes[j]
            p1 = G.nodes[n1]["pos"]
            p2 = G.nodes[n2]["pos"]
            # Basic euclidean distance (good enough for local routing)
            dist = math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)
            G.add_edge(n1, n2, weight=dist)

    # Solve TSP
    try:
        # Using approximation since exact TSP is NP-hard
        tsp_path = nx.approximation.traveling_salesman_problem(G, weight="weight", cycle=True)
        
        # Reorder to start from 'start'
        start_idx = tsp_path.index("start")
        ordered_path = tsp_path[start_idx:] + tsp_path[:start_idx]
        
        # Deduplicate and keep order
        final_path_nodes = []
        seen = set()
        for node in ordered_path:
            if node not in seen:
                final_path_nodes.append(node)
                seen.add(node)
        
        # Map back to details
        hive_dict = {h["id"]: h for h in valid_hives}
        result = []
        for node in final_path_nodes:
            if node == "start":
                result.append({
                    "id": "start",
                    "name": "Start Location",
                    "latitude": request_data.start_point.lat,
                    "longitude": request_data.start_point.lng,
                    "type": "origin"
                })
            else:
                h = hive_dict[node]
                result.append({
                    "id": h["id"],
                    "name": h.get("hive_code") or h.get("name") or f"Hive {h['id'][:8]}",
                    "latitude": G.nodes[node]["pos"][0],
                    "longitude": G.nodes[node]["pos"][1],
                    "type": "hive",
                    "status": h.get("status", "Active")
                })
                
        return {"path": result}
    except Exception as e:
        print(f"[ERROR] Routing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")
