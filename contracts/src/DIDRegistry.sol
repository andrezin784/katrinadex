// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title DIDRegistry
 * @notice Simple Decentralized Identity Registry for KatrinaDEX
 * @dev Users can create DIDs by signing a message with their wallet
 * Compatible with SpruceID/did:pkh standard
 */
contract DIDRegistry is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    // ============ STRUCTS ============
    
    struct DIDCredential {
        string did;              // did:pkh:eip155:CHAIN_ID:ADDRESS
        uint256 createdAt;       // Timestamp of creation
        uint256 expiresAt;       // Expiration timestamp
        bool isActive;           // Active status
        bytes32 credentialHash;  // Hash of additional credentials
    }
    
    // ============ EVENTS ============
    
    event DIDCreated(
        address indexed owner,
        string did,
        uint256 createdAt,
        uint256 expiresAt
    );
    
    event DIDRevoked(address indexed owner, string did);
    
    event DIDRenewed(address indexed owner, string did, uint256 newExpiry);
    
    // ============ STATE ============
    
    // User address => DID Credential
    mapping(address => DIDCredential) public credentials;
    
    // DID string => owner address (reverse lookup)
    mapping(string => address) public didToOwner;
    
    // Default validity period (1 year)
    uint256 public defaultValidityPeriod = 365 days;
    
    // Chain ID for DID generation
    uint256 public immutable chainId;
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        chainId = block.chainid;
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @notice Create a new DID for the caller
     * @param signature Signature of the DID creation message
     * @return did The created DID string
     */
    function createDID(bytes calldata signature) external returns (string memory did) {
        require(credentials[msg.sender].createdAt == 0 || !credentials[msg.sender].isActive, "DID already exists");
        
        // Generate DID in did:pkh format
        did = string(
            abi.encodePacked(
                "did:pkh:eip155:",
                _uintToString(chainId),
                ":",
                _addressToString(msg.sender)
            )
        );
        
        // Verify signature (user signed the DID string)
        bytes32 messageHash = keccak256(abi.encodePacked(did));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        require(signer == msg.sender, "Invalid signature");
        
        // Create credential
        uint256 expiresAt = block.timestamp + defaultValidityPeriod;
        
        credentials[msg.sender] = DIDCredential({
            did: did,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            isActive: true,
            credentialHash: bytes32(0)
        });
        
        didToOwner[did] = msg.sender;
        
        emit DIDCreated(msg.sender, did, block.timestamp, expiresAt);
        
        return did;
    }
    
    /**
     * @notice Revoke caller's DID
     */
    function revokeDID() external {
        require(credentials[msg.sender].isActive, "No active DID");
        
        string memory did = credentials[msg.sender].did;
        credentials[msg.sender].isActive = false;
        delete didToOwner[did];
        
        emit DIDRevoked(msg.sender, did);
    }
    
    /**
     * @notice Renew an expiring DID
     * @param signature Fresh signature of the DID
     */
    function renewDID(bytes calldata signature) external {
        require(credentials[msg.sender].isActive, "No active DID");
        
        string memory did = credentials[msg.sender].did;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(did));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        
        require(signer == msg.sender, "Invalid signature");
        
        // Extend expiry
        uint256 newExpiry = block.timestamp + defaultValidityPeriod;
        credentials[msg.sender].expiresAt = newExpiry;
        
        emit DIDRenewed(msg.sender, did, newExpiry);
    }
    
    /**
     * @notice Add credential hash to DID
     * @param credentialHash Hash of off-chain credentials
     */
    function addCredentialHash(bytes32 credentialHash) external {
        require(credentials[msg.sender].isActive, "No active DID");
        credentials[msg.sender].credentialHash = credentialHash;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Check if a user has a valid DID
     * @param user Address to check
     * @return True if user has valid, non-expired DID
     */
    function hasValidDID(address user) external view returns (bool) {
        DIDCredential memory cred = credentials[user];
        return cred.isActive && block.timestamp < cred.expiresAt;
    }
    
    /**
     * @notice Get DID for an address
     * @param user Address to look up
     * @return DID string (empty if none)
     */
    function getDID(address user) external view returns (string memory) {
        return credentials[user].did;
    }
    
    /**
     * @notice Get full credential info
     * @param user Address to look up
     */
    function getCredential(address user) external view returns (DIDCredential memory) {
        return credentials[user];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateValidityPeriod(uint256 _newPeriod) external onlyOwner {
        defaultValidityPeriod = _newPeriod;
    }
    
    // ============ INTERNAL HELPERS ============
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory data = abi.encodePacked(addr);
        bytes memory str = new bytes(42);
        
        str[0] = "0";
        str[1] = "x";
        
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        
        return string(str);
    }
}

