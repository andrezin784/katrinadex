// DIDRegistry.spec - Formal verification rules for DID Registry
// Verifies: DID uniqueness, ownership, expiration logic

methods {
    function credentials(address) external returns (string, uint256, uint256, bool, bytes32) envfree;
    function hasValidDID(address) external returns (bool) envfree;
    function createDID(bytes) external returns (string);
    function revokeDID() external;
    function renewDID(bytes) external;
}

// ============ RULES ============

// Rule 1: DID creation sets correct owner
rule didCreationSetsOwner(bytes signature) {
    env e;
    
    // Assume no existing DID
    (string did, uint256 createdAt, , , ) = credentials(e.msg.sender);
    require createdAt == 0;
    
    createDID(e, signature);
    
    (string newDid, uint256 newCreatedAt, uint256 expiresAt, bool isActive, ) = credentials(e.msg.sender);
    
    assert newCreatedAt == e.block.timestamp, "Created timestamp should be set";
    assert isActive == true, "DID should be active after creation";
    assert expiresAt > e.block.timestamp, "Expiry should be in the future";
}

// Rule 2: Revoked DID cannot be used
rule revokedDIDNotValid() {
    env e;
    
    // Assume active DID
    (string did, , , bool isActive, ) = credentials(e.msg.sender);
    require isActive == true;
    
    revokeDID(e);
    
    bool isValid = hasValidDID(e.msg.sender);
    
    assert isValid == false, "Revoked DID should not be valid";
}

// Rule 3: Expired DID is not valid
rule expiredDIDNotValid(address user) {
    env e;
    
    (string did, uint256 createdAt, uint256 expiresAt, bool isActive, ) = credentials(user);
    
    // If DID exists but expired
    require isActive == true;
    require e.block.timestamp > expiresAt;
    
    bool isValid = hasValidDID(user);
    
    assert isValid == false, "Expired DID should not be valid";
}

// Rule 4: Cannot create duplicate DID
rule noDuplicateDID(bytes signature1, bytes signature2) {
    env e1;
    env e2;
    require e1.msg.sender == e2.msg.sender;
    
    // First creation
    createDID(e1, signature1);
    
    // Second creation should fail
    createDID@withrevert(e2, signature2);
    
    assert lastReverted, "Duplicate DID creation should revert";
}

// Rule 5: Renewal extends expiry
rule renewalExtendsExpiry(bytes signature) {
    env e;
    
    (string did, , uint256 expiryBefore, bool isActive, ) = credentials(e.msg.sender);
    require isActive == true;
    
    renewDID(e, signature);
    
    (, , uint256 expiryAfter, , ) = credentials(e.msg.sender);
    
    assert expiryAfter > expiryBefore || expiryAfter >= e.block.timestamp + 31536000, "Expiry should be extended";
}

// Rule 6: Only owner can revoke their DID
rule onlyOwnerCanRevoke() {
    env e1;
    env e2;
    require e1.msg.sender != e2.msg.sender;
    
    // e1 creates DID
    bytes signature;
    createDID(e1, signature);
    
    // e2 tries to revoke (should fail - different sender context)
    // This tests that each user can only revoke their own DID
    (string did1, , , bool isActive1, ) = credentials(e1.msg.sender);
    (string did2, , , bool isActive2, ) = credentials(e2.msg.sender);
    
    require isActive1 == true;
    require isActive2 == false;
    
    revokeDID(e2);
    
    // e1's DID should still be active
    (string didAfter, , , bool isActiveAfter, ) = credentials(e1.msg.sender);
    assert isActiveAfter == true, "Other user's DID should not be affected";
}

