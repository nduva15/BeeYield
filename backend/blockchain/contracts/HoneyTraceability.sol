// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HoneyTraceability
 * @dev Stores immutable records of honey production from Hive to Table.
 */
contract HoneyTraceability {
    
    struct Batch {
        uint256 id;
        string beekeeperName;
        string farmLocation;
        uint256 harvestTimestamp;
        string floralSource;
        string honeyType;
        string processingNotes;
        uint256 processingTimestamp;
        string shippingDetails;
        uint256 shippingTimestamp;
        bool exists;
    }

    mapping(uint256 => Batch) public batches;
    uint256 public batchCount;

    event BatchCreated(uint256 indexed id, string beekeeperName, uint256 timestamp);
    event ProcessingAdded(uint256 indexed id, string notes, uint256 timestamp);
    event ShippingAdded(uint256 indexed id, string details, uint256 timestamp);

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // 1. HARVEST (Creation of the Batch)
    function createHarvestBatch(
        string memory _beekeeperName,
        string memory _farmLocation,
        string memory _floralSource,
        string memory _honeyType
    ) public onlyOwner returns (uint256) {
        batchCount++;
        uint256 newId = batchCount;

        Batch storage b = batches[newId];
        b.id = newId;
        b.beekeeperName = _beekeeperName;
        b.farmLocation = _farmLocation;
        b.floralSource = _floralSource;
        b.honeyType = _honeyType;
        b.harvestTimestamp = block.timestamp;
        b.exists = true;

        emit BatchCreated(newId, _beekeeperName, block.timestamp);
        return newId;
    }

    // 2. PROCESSING
    function addProcessingDetails(uint256 _batchId, string memory _notes) public onlyOwner {
        require(batches[_batchId].exists, "Batch does not exist");
        batches[_batchId].processingNotes = _notes;
        batches[_batchId].processingTimestamp = block.timestamp;
        
        emit ProcessingAdded(_batchId, _notes, block.timestamp);
    }

    // 3. SHIPPING
    function addShippingDetails(uint256 _batchId, string memory _details) public onlyOwner {
        require(batches[_batchId].exists, "Batch does not exist");
        batches[_batchId].shippingDetails = _details;
        batches[_batchId].shippingTimestamp = block.timestamp;
        
        emit ShippingAdded(_batchId, _details, block.timestamp);
    }

    // 4. CLIENT VIEW (Public)
    function getBatchDetails(uint256 _batchId) public view returns (Batch memory) {
        require(batches[_batchId].exists, "Batch does not exist");
        return batches[_batchId];
    }
}
