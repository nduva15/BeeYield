"""
BeeYield Honey Blockchain - Complete Traceability Chain
A custom blockchain implementation for tracking honey from hive to jar
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import threading
from .honey_block import HoneyBlock, BlockType
from .crypto_utils import BeeYieldCrypto


class HoneyBlockchain:
    """
    The BeeYield Honey Blockchain - A complete traceability solution.
    
    Features:
    - Full chain of custody tracking
    - Proof of Work consensus
    - Merkle tree data verification
    - Digital signatures for authentication
    - Support for all traceability record types
    """
    
    def __init__(self, difficulty: int = 2, auto_mine: bool = True):
        """
        Initialize the blockchain.
        
        Args:
            difficulty: Number of leading zeros required in block hash
            auto_mine: Whether to automatically mine blocks when added
        """
        self.chain: List[HoneyBlock] = []
        self.pending_records: List[Dict[str, Any]] = []
        self.difficulty = difficulty
        self.auto_mine = auto_mine
        self.crypto = BeeYieldCrypto()
        self._lock = threading.Lock()
        
        # Try to load existing chain
        if not self._load_chain():
            # Create genesis block
            self._create_genesis_block()
            
            # Seed demo data if in development mode or explicitly requested
            self._bootstrap_demo_data()
    
    def _create_genesis_block(self) -> None:
        """Create the first block in the chain"""
        genesis_data = {
            "message": "🐝 BeeYield Honey Traceability Genesis Block 🍯",
            "mission": "Empowering beekeepers, protecting bees, ensuring honey authenticity",
            "version": "2.0",
            "created": datetime.utcnow().isoformat(),
            "network": "BeeYield Private Chain",
            "initial_metrics": {
                "apiaries": 0,
                "hives": 0,
                "farmers": 0,
                "honey_kg": 0
            }
        }
        
        genesis_block = HoneyBlock(
            index=0,
            block_type=BlockType.GENESIS,
            data=genesis_data,
            previous_hash="0" * 64,
            creator_signature="GENESIS"
        )
        
        self.chain.append(genesis_block)
    
    @property
    def last_block(self) -> HoneyBlock:
        """Get the last block in the chain"""
        return self.chain[-1]
    
    @property
    def chain_length(self) -> int:
        """Get the number of blocks in the chain"""
        return len(self.chain)
    
    def add_block(
        self,
        block_type: BlockType,
        data: Dict[str, Any],
        creator_id: str = "SYSTEM"
    ) -> HoneyBlock:
        """
        Add a new block to the chain.
        
        Args:
            block_type: Type of traceability record
            data: The data to store in the block
            creator_id: ID of the entity creating this record
        
        Returns:
            The newly created and added block
        """
        with self._lock:
            # Generate signature for the creator
            private_key, _ = self.crypto.generate_keypair(creator_id)
            signature = self.crypto.sign_data(data, private_key)
            
            # Create new block
            new_block = HoneyBlock(
                index=self.last_block.index + 1,
                block_type=block_type,
                data={
                    **data,
                    "record_id": self.crypto.generate_unique_id(),
                    "created_by": creator_id,
                    "chain_timestamp": datetime.utcnow().isoformat()
                },
                previous_hash=self.last_block.hash,
                creator_signature=signature
            )
            
            # Mine the block if auto_mine is enabled
            if self.auto_mine:
                new_block.mine_block()
            
            self.chain.append(new_block)
            self._save_chain()
            return new_block
    
    def _get_chain_path(self) -> str:
        """Get absolute path for the blockchain data file"""
        import os
        # Save in the same directory as this file
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), "traceability_chain.json")

    def _save_chain(self) -> None:
        """Save the blockchain to disk"""
        try:
            chain_data = [block.to_dict() for block in self.chain]
            with open(self._get_chain_path(), "w") as f:
                json.dump(chain_data, f, indent=2)
            print(f"BLOCKCHAIN saved to {self._get_chain_path()}")
        except Exception as e:
            print(f"FAILED to save blockchain: {e}")

    def _load_chain(self) -> bool:
        """Load blockchain from disk"""
        try:
             import os
             import json
             path = self._get_chain_path()
             if not os.path.exists(path):
                 print(f"INFO: No existing blockchain found at {path}")
                 return False
                 
             print(f"LOAD: Loading blockchain from {path}...")
             with open(path, "r") as f:
                 chain_data = json.load(f)
             
             self.chain = []
             for b_data in chain_data:
                 # Helper to safely convert string to Enum
                 b_type_str = b_data["block_type"]
                 try:
                    b_type = BlockType(b_type_str)
                 except ValueError:
                    # Fallback for old/mismatched data
                    b_type = BlockType.GENESIS 

                 block = HoneyBlock(
                     index=b_data["index"],
                     block_type=b_type,
                     data=b_data["data"],
                     previous_hash=b_data["previous_hash"],
                     creator_signature=b_data["creator_signature"],
                     timestamp=b_data["timestamp"],
                     nonce=b_data["nonce"],
                     merkle_root=b_data["merkle_root"]
                 )
                 block.hash = b_data["hash"] # Restore hash
                 self.chain.append(block)
             
             print(f"OK: Loaded {len(self.chain)} blocks from disk.")
             return True
        except Exception as e:
            print(f"ERROR: Failed to load blockchain: {e}")
            return False
    
    # ==================== FARMER OPERATIONS ====================
    
    def register_farmer(self, farmer_data: Dict[str, Any]) -> HoneyBlock:
        """
        Register a new farmer/beekeeper on the blockchain.
        
        Expected data:
        - farmer_id: Unique identifier
        - name: Full name
        - phone: Phone number
        - region: Geographic region
        - county: County/district
        - village: Village/town
        - coordinates: GPS coordinates
        - registration_date: Date of registration
        - certifications: List of certifications
        """
        enriched_data = {
            **farmer_data,
            "entity_type": "FARMER",
            "status": "ACTIVE",
            "public_key": self.crypto.generate_keypair(farmer_data.get("farmer_id", ""))[1]
        }
        
        return self.add_block(
            block_type=BlockType.FARMER_REGISTRATION,
            data=enriched_data,
            creator_id=farmer_data.get("farmer_id", "SYSTEM")
        )
    
    # ==================== APIARY OPERATIONS ====================
    
    def register_apiary(self, apiary_data: Dict[str, Any]) -> HoneyBlock:
        """
        Register a new apiary (bee yard) on the blockchain.
        
        Expected data:
        - apiary_id: Unique identifier
        - apiary_code: Human-readable code (e.g., "NYR-001")
        - name: Apiary name
        - farmer_id: Owner's farmer ID
        - location_name: Description of location
        - region: Geographic region
        - county: County
        - coordinates: {"latitude": x, "longitude": y}
        - altitude_meters: Altitude above sea level
        - environment_type: Forest, Savannah, Farmland, etc.
        - flora_types: List of predominant flowers/plants
        - water_source: Nearby water source
        - established_date: Date established
        """
        enriched_data = {
            **apiary_data,
            "entity_type": "APIARY",
            "status": "ACTIVE",
            "hive_count": 0,
            "total_honey_kg": 0
        }
        
        return self.add_block(
            block_type=BlockType.APIARY_REGISTRATION,
            data=enriched_data,
            creator_id=apiary_data.get("farmer_id", "SYSTEM")
        )
    
    # ==================== HIVE OPERATIONS ====================
    
    def register_hive(self, hive_data: Dict[str, Any]) -> HoneyBlock:
        """
        Register a new hive on the blockchain.
        
        Expected data:
        - hive_id: Unique identifier
        - hive_code: Human-readable code (e.g., "NYR-001-H05")
        - hive_number: Number within the apiary
        - apiary_id: Parent apiary ID
        - farmer_id: Owner's farmer ID
        - bee_type: Type of bees (e.g., "African Honey Bee", "Apis mellifera scutellata")
        - hive_type: Type of hive (Langstroth, Top Bar, Log, etc.)
        - material: Construction material
        - installation_date: Date installed
        - queen_status: Status of the queen
        - colony_strength: Estimated colony strength
        - initial_frame_count: Number of frames
        """
        enriched_data = {
            **hive_data,
            "entity_type": "HIVE",
            "status": "ACTIVE",
            "is_monitored": hive_data.get("has_sensors", False),
            "total_harvests": 0,
            "total_honey_kg": 0
        }
        
        return self.add_block(
            block_type=BlockType.HIVE_REGISTRATION,
            data=enriched_data,
            creator_id=hive_data.get("farmer_id", "SYSTEM")
        )
    
    # ==================== SENSOR DATA OPERATIONS ====================
    
    def record_sensor_data(self, sensor_data: Dict[str, Any]) -> HoneyBlock:
        """
        Record IoT sensor data from a hive.
        
        Expected data:
        - hive_id: Hive identifier
        - reading_timestamp: When the reading was taken
        - temperature_celsius: Internal hive temperature
        - humidity_percent: Internal humidity
        - weight_kg: Hive weight
        - sound_level_db: Sound level (bee activity indicator)
        - vibration_index: Vibration measurement
        - external_temperature: External temperature
        - weather_conditions: Current weather
        - bee_activity_level: Calculated activity level (1-10)
        """
        enriched_data = {
            **sensor_data,
            "record_type": "SENSOR_READING",
            "anomalies_detected": self._detect_anomalies(sensor_data)
        }
        
        return self.add_block(
            block_type=BlockType.HIVE_SENSOR_DATA,
            data=enriched_data,
            creator_id=sensor_data.get("hive_id", "SENSOR_SYSTEM")
        )
    
    def record_bulk_sensor_data(self, readings: List[Dict[str, Any]]) -> HoneyBlock:
        """
        Record multiple sensor readings in a single block.
        More efficient for batch processing.
        """
        return self.add_block(
            block_type=BlockType.HIVE_SENSOR_DATA,
            data={
                "record_type": "SENSOR_BATCH",
                "readings": readings,
                "reading_count": len(readings),
                "batch_timestamp": datetime.utcnow().isoformat()
            },
            creator_id="SENSOR_SYSTEM"
        )
    
    def _detect_anomalies(self, sensor_data: dict) -> List[str]:
        """Detect anomalies in sensor readings"""
        anomalies = []
        
        temp = sensor_data.get("temperature_celsius", 35)
        humidity = sensor_data.get("humidity_percent", 50)
        
        # Temperature anomalies
        if temp > 40:
            anomalies.append("HIGH_TEMPERATURE")
        elif temp < 30:
            anomalies.append("LOW_TEMPERATURE")
        
        # Humidity anomalies
        if humidity > 80:
            anomalies.append("HIGH_HUMIDITY")
        elif humidity < 30:
            anomalies.append("LOW_HUMIDITY")

        # Audio/Disease anomalies (Explicitly passed)
        if "audio_anomaly" in sensor_data:
            anomalies.append(sensor_data["audio_anomaly"])
        
        return anomalies

    # ... (rest of methods) ...

    # ==================== HARVEST OPERATIONS ====================
    
    def record_harvest(self, harvest_data: Dict[str, Any]) -> HoneyBlock:
        """
        Record a honey harvest on the blockchain.
        
        Expected data:
        - harvest_id: Unique identifier
        - hive_id: Source hive ID
        - apiary_id: Source apiary ID
        - farmer_id: Harvester's ID
        - harvester_name: Name of person who harvested
        - harvest_date: Date of harvest
        - quantity_kg: Amount harvested in kg
        - left_for_bees_kg: Amount left for bees (should be ~50%)
        - extraction_method: Method used (Centrifuge, Crush & Strain, etc.)
        - honey_color: Color description
        - initial_moisture_content: Moisture percentage
        - flower_sources: List of flower sources (based on season/location)
        - bee_flower: Primary nectar source flower
        - weather_at_harvest: Weather conditions
        - notes: Additional observations
        """
        enriched_data = {
            **harvest_data,
            "record_type": "HARVEST",
            "sustainability_score": self._calculate_sustainability_score(harvest_data),
            "harvest_code": self.crypto.generate_unique_id()[:12].upper()
        }
        
        return self.add_block(
            block_type=BlockType.HARVEST_RECORD,
            data=enriched_data,
            creator_id=harvest_data.get("farmer_id", "SYSTEM")
        )
    
    def _calculate_sustainability_score(self, harvest_data: dict) -> int:
        """Calculate sustainability score based on harvest practices"""
        score = 70  # Base score
        
        # Check if enough honey left for bees
        qty = harvest_data.get("quantity_kg", 0)
        left = harvest_data.get("left_for_bees_kg", 0)
        
        if qty > 0:
            left_ratio = left / (qty + left)
            if left_ratio >= 0.5:
                score += 20  # Good practice
            elif left_ratio >= 0.3:
                score += 10
            else:
                score -= 10  # Poor practice
        
        # Extraction method points
        method = harvest_data.get("extraction_method", "").lower()
        if "centrifuge" in method:
            score += 5  # Gentle extraction
        elif "crush" in method:
            score += 3
        
        return min(100, max(0, score))
    
    # ==================== PROCESSING OPERATIONS ====================
    
    def record_processing(self, processing_data: Dict[str, Any]) -> HoneyBlock:
        """
        Record honey processing/packaging on the blockchain.
        
        Expected data:
        - processing_id: Unique identifier
        - harvest_ids: List of harvest IDs being processed
        - facility_name: Processing facility
        - facility_location: Location of facility
        - processing_date: Date of processing
        - processing_method: Filtration, Settling, etc.
        - final_moisture_content: Final moisture percentage
        - quality_grade: A, B, C grade
        - batch_quantity_kg: Total batch quantity
        - jar_sizes: List of jar sizes produced
        - jar_count: Number of jars produced
        - certifications: Any certifications (Organic, etc.)
        """
        enriched_data = {
            **processing_data,
            "record_type": "PROCESSING",
            "processing_code": self.crypto.generate_unique_id()[:12].upper()
        }
        
        return self.add_block(
            block_type=BlockType.PROCESSING_RECORD,
            data=enriched_data,
            creator_id=processing_data.get("processed_by", "SYSTEM")
        )
    
    # ==================== BATCH OPERATIONS ====================
    
    def create_batch(self, batch_data: Dict[str, Any]) -> HoneyBlock:
        """
        Create a traceable batch of honey jars.
        
        Expected data:
        - batch_id: Unique identifier
        - processing_id: Source processing record
        - batch_code: Human-readable batch code
        - honey_type: Type of honey (Acacia, Wild Flower, etc.)
        - quantity_kg: Batch quantity
        - jar_count: Number of jars in batch
        - jar_size_ml: Size of each jar
        - production_date: Date of production
        - best_before: Best before date
        - qr_code_data: QR code content for jars
        """
        # Generate unique batch code only if not provided
        if "batch_code" in batch_data:
            batch_code = batch_data["batch_code"]
        else:
            batch_code = self.crypto.generate_batch_code(
                apiary_code=batch_data.get("apiary_code", "UNK"),
                harvest_date=datetime.now(),
                honey_type=batch_data.get("honey_type", "WILD"),
                batch_number=self.chain_length
            )
        
        enriched_data = {
            **batch_data,
            "record_type": "BATCH",
            "batch_code": batch_code,
            "qr_verify_url": f"https://beeyield.co.ke/trace/{batch_code}",
            "blockchain_index": self.chain_length
        }
        
        return self.add_block(
            block_type=BlockType.BATCH_CREATION,
            data=enriched_data,
            creator_id=batch_data.get("created_by", "SYSTEM")
        )
    
    # ==================== QUALITY TESTING ====================
    
    def record_quality_test(self, test_data: Dict[str, Any]) -> HoneyBlock:
        """
        Record quality test results.
        
        Expected data:
        - test_id: Unique identifier
        - batch_id: Batch being tested
        - test_date: Date of testing
        - tester_name: Who performed the test
        - lab_name: Testing laboratory
        - moisture_content: Moisture percentage
        - sugar_content: Sugar levels
        - pollen_analysis: Pollen types found
        - contaminant_test: Contaminant test results
        - antibiotic_test: Antibiotic residue test
        - color_grade: Pfund color grade
        - passed: Whether it passed all tests
        """
        enriched_data = {
            **test_data,
            "record_type": "QUALITY_TEST",
            "test_code": self.crypto.generate_unique_id()[:12].upper()
        }
        
        return self.add_block(
            block_type=BlockType.QUALITY_TEST,
            data=enriched_data,
            creator_id=test_data.get("tester_id", "QUALITY_LAB")
        )
    
    # ==================== CHAIN VERIFICATION ====================
    
    def verify_chain(self) -> Dict[str, Any]:
        """
        Verify the entire blockchain integrity.
        
        Returns detailed verification report.
        """
        if len(self.chain) < 2:
            return {
                "valid": True,
                "blocks_verified": len(self.chain),
                "message": "Chain is valid (only genesis block)"
            }
        
        issues = []
        
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]
            
            # Verify hash calculation
            if current.hash != current.calculate_hash():
                issues.append({
                    "block_index": i,
                    "issue": "HASH_MISMATCH",
                    "message": f"Block {i} hash doesn't match calculated hash"
                })
            
            # Verify chain linkage
            if current.previous_hash != previous.hash:
                issues.append({
                    "block_index": i,
                    "issue": "CHAIN_BREAK",
                    "message": f"Block {i} previous_hash doesn't match Block {i-1} hash"
                })
            
            # Verify Proof of Work
            if not current.hash.startswith("0" * self.difficulty):
                issues.append({
                    "block_index": i,
                    "issue": "INVALID_POW",
                    "message": f"Block {i} doesn't meet difficulty requirement"
                })
        
        return {
            "valid": len(issues) == 0,
            "blocks_verified": len(self.chain),
            "issues": issues,
            "verification_timestamp": datetime.utcnow().isoformat()
        }
    
    # ==================== SEARCH & QUERY ====================
    
    def get_chain_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get the chain history as list of dictionaries"""
        return [block.to_dict() for block in self.chain[-limit:]]
    
    def get_block_by_index(self, index: int) -> Optional[Dict[str, Any]]:
        """Get a specific block by its index"""
        if 0 <= index < len(self.chain):
            return self.chain[index].to_dict()
        return None
    
    def search_by_record_id(self, record_id: str) -> Optional[Dict[str, Any]]:
        """
        Search for a block by its record ID or entity-specific IDs.
        Searches for: record_id, farmer_id, apiary_id, hive_id, harvest_id, 
        processing_id, batch_id to enable full traceability.
        """
        if not record_id:
            return None
            
        id_fields = [
            "record_id", "farmer_id", "apiary_id", "hive_id", 
            "harvest_id", "processing_id", "batch_id"
        ]
        
        for block in self.chain:
            for field in id_fields:
                if block.data.get(field) == record_id:
                    return block.to_dict()
        return None
    
    def search_by_type(self, block_type: BlockType) -> List[Dict[str, Any]]:
        """Get all blocks of a specific type"""
        return [
            block.to_dict() for block in self.chain 
            if block.block_type == block_type
        ]
    
    def get_farmer_history(self, farmer_id: str) -> List[Dict[str, Any]]:
        """Get all blocks related to a specific farmer"""
        return [
            block.to_dict() for block in self.chain
            if block.data.get("farmer_id") == farmer_id
        ]
    
    def get_hive_history(self, hive_id: str) -> List[Dict[str, Any]]:
        """Get all blocks related to a specific hive"""
        return [
            block.to_dict() for block in self.chain
            if block.data.get("hive_id") == hive_id
        ]
    
    def trace_batch(self, batch_code: str) -> Dict[str, Any]:
        """
        Get complete traceability info for a batch code.
        Returns the full journey from hive to jar with all linked entities.
        """
        # Find the batch block
        batch_block = None
        for block in self.chain:
            if block.data.get("batch_code") == batch_code:
                batch_block = block
                break
        
        if not batch_block:
            return {"found": False, "message": "Batch not found"}
        
        batch_data = batch_block.data
        
        # Follow the chain to find linked entities
        # Look for harvest_id in batch, then get hive_id, apiary_id, farmer_id from harvest
        harvest_id = batch_data.get("harvest_id")
        harvest_block = self.search_by_record_id(harvest_id) if harvest_id else None
        
        harvest_data = harvest_block.get("data", {}) if harvest_block else {}
        
        # Get IDs from harvest data
        hive_id = harvest_data.get("hive_id") or batch_data.get("hive_id")
        apiary_id = harvest_data.get("apiary_id") or batch_data.get("apiary_id")
        farmer_id = harvest_data.get("farmer_id") or batch_data.get("farmer_id")
        
        # Update batch_details with the linked IDs for the traceability service
        enriched_batch_details = {
            **batch_data,
            "harvest_id": harvest_id,
            "hive_id": hive_id,
            "apiary_id": apiary_id,
            "farmer_id": farmer_id,
        }
        
        # Build the trace
        trace = {
            "found": True,
            "batch_code": batch_code,
            "blockchain_verified": True,
            "block_hash": batch_block.hash,
            "verification_url": f"https://beeyield.co.ke/verify/{batch_block.hash[:16]}",
            "batch_details": enriched_batch_details,
            "journey": {
                "batch": batch_block.to_dict(),
                "harvest": harvest_block,
                "hive_id": hive_id,
                "apiary_id": apiary_id,
                "farmer_id": farmer_id
            },
            "chain_stats": {
                "total_blocks": len(self.chain),
                "chain_valid": self.verify_chain()["valid"]
            }
        }
        
        return trace
    
    def get_chain_stats(self) -> Dict[str, Any]:
        """Get statistics about the blockchain"""
        block_types = {}
        for block in self.chain:
            bt = block.block_type.value
            block_types[bt] = block_types.get(bt, 0) + 1
        
        return {
            "total_blocks": len(self.chain),
            "genesis_timestamp": datetime.fromtimestamp(self.chain[0].timestamp).isoformat(),
            "latest_timestamp": datetime.fromtimestamp(self.chain[-1].timestamp).isoformat(),
            "difficulty": self.difficulty,
            "block_types": block_types,
            "chain_valid": self.verify_chain()["valid"]
        }


    def _bootstrap_demo_data(self) -> None:
        """
        Populate the blockchain with premium demo data if it's empty.
        This ensures the 'DEMO-001' batch is always ready for demonstration.
        """
        if self.chain_length > 1:
            return  # Already has data

        print("BEE: Initializing HoneyChain Bootstrap...")
        
        try:
            # 1. Register Only One Farmer: Timothy Nduva
            self.register_farmer({
                "farmer_id": "F-MAT-001", 
                "name": "Timothy Nduva", 
                "region": "Eastern", 
                "county": "Makueni",
                "location_name": "Kibwezi HQ", 
                "coordinates": {"latitude": -2.41, "longitude": 37.97},
                "story": "Timothy is a master beekeeper in Kibwezi, dedicated to sustainable pollination and protecting the African honey bee.",
                "registration_date": (datetime.now() - timedelta(days=600)).isoformat()
            })

            # 2. Register Apiary for Timothy
            self.register_apiary({
                "apiary_id": "A-KIB-SAVANNAH", 
                "apiary_code": "KIB-01", 
                "name": "Kibwezi Savannah Apiary",
                "farmer_id": "F-MAT-001", 
                "location_name": "Kibwezi", 
                "region": "Eastern", 
                "county": "Makueni",
                "coordinates": {"latitude": -2.41, "longitude": 37.97}, 
                "environment_type": "Savannah Wooded",
                "flora_types": ["Acacia Tortilis", "Citrus", "Wildflowers"]
            })

            # 3. Register Hive
            self.register_hive({
                "hive_id": "H-KIB-01-01", 
                "hive_code": "KIB-01-H01", 
                "apiary_id": "A-KIB-SAVANNAH",
                "farmer_id": "F-MAT-001", 
                "bee_type": "African Honey Bee", 
                "hive_type": "Langstroth",
                "has_sensors": True, 
                "installation_date": "2020-05-20"
            })

            # 4. Record Sensor Data (with Health Shield Trigger)
            self.record_sensor_data({
                "hive_id": "H-KIB-01-01",
                "apiary_id": "A-KIB-SAVANNAH",
                "timestamp": "2023-12-20T10:30:00",
                "temperature": 34.2,
                "humidity": 65.5,
                "weight": 28.5,
                "audio_anomaly": "ACOUSTIC_VARROA_PATTERN"
            })

            # 5. Record Harvest
            self.record_harvest({
                "harvest_id": "HRV-KIB-01-24", 
                "hive_id": "H-KIB-01-01", 
                "apiary_id": "A-KIB-SAVANNAH",
                "farmer_id": "F-MAT-001", 
                "harvester_name": "Timothy Nduva",
                "harvest_date": "2024-01-15", 
                "quantity_kg": 15.5, 
                "left_for_bees_kg": 15.5,
                "extraction_method": "Centrifuge", 
                "honey_type": "Acacia", 
                "bee_flower": "Acacia"
            })

            # 6. Create Batches
            # DEMO-001 (Main Demo)
            self.create_batch({
                "batch_id": "BATCH-DEMO-001",
                "batch_code": "DEMO-001",
                "honey_type": "Kibwezi Premium Acacia",
                "harvest_id": "HRV-KIB-01-24",
                "apiary_code": "KIB-01",
                "production_date": datetime.now().isoformat(),
                "created_by": "SYSTEM",
                "impact_stats": {
                    "acres_pollinated": "25+ Acres",
                    "beekeepers": "1 Beekeeper",
                    "bees_protected": "Yes",
                    "carbon_sequestered": "1.2 Tons"
                }
            })

            # KIB-ACACIA-24
            self.create_batch({
                "batch_id": "BATCH-KIB-001", 
                "batch_code": "KIB-ACACIA-24", 
                "honey_type": "Organic Acacia",
                "harvest_id": "HRV-KIB-01-24", 
                "apiary_code": "KIB-01", 
                "production_date": "2024-01-20",
                "created_by": "SYSTEM",
                "impact_stats": {
                    "acres_pollinated": "25+ Acres",
                    "beekeepers": "1 Beekeeper"
                }
            })

            # KIB-GOLD-24
            self.create_batch({
                "batch_id": "BATCH-KIB-002", 
                "batch_code": "KIB-GOLD-24", 
                "honey_type": "Savannah Gold",
                "harvest_id": "HRV-KIB-01-24", 
                "apiary_code": "KIB-01", 
                "production_date": "2024-02-25",
                "created_by": "SYSTEM",
                "impact_stats": {
                    "acres_pollinated": "25+ Acres",
                    "beekeepers": "1 Beekeeper"
                }
            })

        except Exception as e:
            print(f"❌ HoneyChain Bootstrap Failed: {e}")


# Global blockchain instance

honey_blockchain = HoneyBlockchain(difficulty=2, auto_mine=True)
