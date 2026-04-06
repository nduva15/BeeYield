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
    bloom_intensity: float = 1.0
    forage_condition: float = 1.0

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

    @staticmethod
    def _clamp(value: float, minimum: float, maximum: float) -> float:
        return max(minimum, min(maximum, value))

    def _normalized_coord(self, value: float, start: float, end: float) -> float:
        span = max(1e-9, end - start)
        return self._clamp((value - start) / span, 0.0, 1.0)

    def _bloom_surface(self, x_norm: float, y_norm: float) -> float:
        ridge = 0.45 + 0.25 * math.sin((x_norm + 0.15) * math.pi) + 0.2 * math.cos((y_norm + 0.1) * math.pi * 1.5)
        patch = 0.1 * math.sin((x_norm - y_norm) * math.pi * 2.0)
        return self._clamp(ridge + patch, 0.0, 1.0)

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
        centroid = geom.centroid
        boundary = geom.boundary
        
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
                    candidates.append((pt, self._calculate_base_score(pt, orchard_geojson, centroid, boundary, minx, miny, maxx, maxy)))
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

    def _calculate_base_score(
        self,
        pt: Point,
        orchard_geojson: Dict[str, Any],
        centroid: Point,
        boundary,
        minx: float,
        miny: float,
        maxx: float,
        maxy: float,
    ) -> float:
        """
        Calculate a smoother AHP-based score using bloom surface, edge clearance,
        and centroid balance instead of the old pseudo-random patchiness.
        """
        x_norm = self._normalized_coord(pt.x, minx, maxx)
        y_norm = self._normalized_coord(pt.y, miny, maxy)

        bloom_surface = self._bloom_surface(x_norm, y_norm)

        dist_to_center_km = pt.distance(centroid) * self.deg_to_km
        centroid_score = math.exp(-((dist_to_center_km / max(0.3, self.config.bee_flight_radius_km * 0.95)) ** 2))

        edge_clearance_km = boundary.distance(pt) * self.deg_to_km
        edge_score = self._clamp(edge_clearance_km / max(0.15, self.config.bee_flight_radius_km * 0.4), 0.0, 1.0)

        terrain_balance = 1.0 - abs(0.5 - x_norm) * 0.35 - abs(0.5 - y_norm) * 0.35
        terrain_balance = self._clamp(terrain_balance, 0.0, 1.0)

        bloom_weight = self.config.ahp_weights.get("bloom", 0.5)
        road_weight = self.config.ahp_weights.get("roads", 0.3)
        water_weight = self.config.ahp_weights.get("water", 0.2)
        weight_total = max(1e-6, bloom_weight + road_weight + water_weight)

        bloom_component = bloom_surface * self._clamp(0.55 + 0.45 * self.config.bloom_intensity, 0.3, 1.4)
        forage_component = terrain_balance * self._clamp(0.45 + 0.55 * self.config.forage_condition, 0.25, 1.35)

        weighted_score = (
            (bloom_component * bloom_weight)
            + (edge_score * road_weight)
            + (forage_component * water_weight)
        ) / weight_total

        score = 100.0 * (
            0.5 * weighted_score
            + 0.3 * centroid_score
            + 0.2 * edge_score
        )

        return round(self._clamp(score, 0.0, 100.0), 2)
