"""
Spatial Optimization Engine for Precision Pollination
=====================================================
Uses Shapely to compute optimal hive placement geometries maximizing FPI
(Flower-Pollinator Interaction) and considering AHP weights for topology.
"""
from typing import List, Dict, Any
import math
from shapely.geometry import shape, Point
from pydantic import BaseModel

class OptimizerConfig(BaseModel):
    bee_flight_radius_km: float = 1.5
    ahp_weights: Dict[str, float] = {"bloom": 0.5, "roads": 0.3, "water": 0.2}

class PlacementResult(BaseModel):
    lat: float
    lng: float
    score: float
    coverage_radius_km: float
    metadata: Dict[str, Any]

class SpatialOptimizer:
    def __init__(self, config: OptimizerConfig = OptimizerConfig()):
        self.config = config
        # Approximations for lat/lng conversions
        self.deg_to_km = 111.0

    def optimize_placement(
        self, 
        orchard_geojson: Dict[str, Any], 
        hive_count: int, 
        target_crop: str
    ) -> List[PlacementResult]:
        """
        Runs a Greedy Algorithm to maximize coverage over the provided orchard boundary.
        Uses a grid of candidate points and weights them.
        """
        # Parse boundary
        if "features" not in orchard_geojson or not orchard_geojson["features"]:
            return []
            
        boundary_feature = next((f for f in orchard_geojson["features"] if f.get("geometry", {}).get("type") in ["Polygon", "MultiPolygon"]), None)
        if not boundary_feature:
            return []
            
        geom = shape(boundary_feature["geometry"])
        if not geom.is_valid:
            geom = geom.buffer(0)
            
        # Get bounding box
        minx, miny, maxx, maxy = geom.bounds
        
        # Determine grid size (e.g., cell size corresponding to 100m)
        cell_size_km = 0.1
        cell_size_deg = cell_size_km / self.deg_to_km
        
        # Generating candidate grid inside the geometry
        candidates = []
        x = minx
        while x <= maxx:
            y = miny
            while y <= maxy:
                pt = Point(x, y)
                if geom.contains(pt):
                    candidates.append((pt, self._calculate_base_score(pt, orchard_geojson)))
                y += cell_size_deg
            x += cell_size_deg

        if not candidates:
            # Fallback if too small
            centroid = geom.centroid
            return [PlacementResult(
                lat=centroid.y, 
                lng=centroid.x, 
                score=100.0, 
                coverage_radius_km=self.config.bee_flight_radius_km, 
                metadata={"type": "fallback_centroid"}
            )]

        # Greedy selection
        selected_placements = []
        coverage_radius_deg = self.config.bee_flight_radius_km / self.deg_to_km
        
        # Copy to manipulate
        available_candidates = list(candidates)
        
        for i in range(min(hive_count, len(candidates))):
            if not available_candidates:
                break
                
            # Score each available candidate considering penalty for already placed hives
            scored_candidates = []
            for pt, base_score in available_candidates:
                penalty = 0.0
                for place in selected_placements:
                    p_pt = Point(place.lng, place.lat)
                    dist_deg = pt.distance(p_pt)
                    if dist_deg < coverage_radius_deg:
                        # Overlap penalty (closer = more penalty)
                        overlap = 1.0 - (dist_deg / coverage_radius_deg)
                        penalty += overlap * 50.0 # High penalty for heavy overlap
                        
                final_score = base_score - penalty
                scored_candidates.append((final_score, pt, base_score))
                
            # Pick best candidate
            scored_candidates.sort(key=lambda x: x[0], reverse=True)
            best_score, best_pt, original_base = scored_candidates[0]
            
            selected_placements.append(PlacementResult(
                lat=best_pt.y,
                lng=best_pt.x,
                score=round(max(0, best_score), 2),
                coverage_radius_km=self.config.bee_flight_radius_km,
                metadata={"target_crop": target_crop, "index": i + 1}
            ))
            
            # Remove the chosen point and extremely close neighbors from available candidates
            too_close_deg = 0.05 / self.deg_to_km # 50 meters
            available_candidates = [
                (c_pt, c_score) for c_pt, c_score in available_candidates 
                if c_pt.distance(best_pt) > too_close_deg
            ]

        return selected_placements

    def _calculate_base_score(self, pt: Point, orchard_geojson: Dict[str, Any]) -> float:
        """
        Calculate AHP-based score. 
        Mocks road proximity, water sources, and bloom intensity for now unless features exist.
        """
        score = 50.0 # Base uniform score
        
        # In a full implementation we would check distance to lines inside orchard_geojson 
        # that represent 'roads' or 'water'.
        
        # Apply weights
        # bloom (default to ok everywhere)
        score += 20 * self.config.ahp_weights.get("bloom", 0.5)
        
        # Introduce a little pseudo-random but deterministic variation based on coords
        # to simulate bloom patchiness
        variation = math.sin(pt.x * 1000) * math.cos(pt.y * 1000) * 15
        score += variation
        
        return min(100.0, max(0.0, score))
