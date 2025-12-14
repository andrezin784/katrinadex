export const MIXER_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "internalType": "uint256", "name": "poolIndex", "type": "uint256" },
      { "internalType": "uint256[2]", "name": "licitProofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "licitProofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "licitProofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "licitProofInput", "type": "uint256[3]" }
    ],
    "name": "depositETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "internalType": "uint256", "name": "poolIndex", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256[2]", "name": "licitProofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "licitProofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "licitProofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "licitProofInput", "type": "uint256[3]" }
    ],
    "name": "depositUSDC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "internalType": "uint256", "name": "poolIndex", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256[2]", "name": "licitProofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "licitProofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "licitProofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "licitProofInput", "type": "uint256[3]" }
    ],
    "name": "depositEURC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256[2]", "name": "proofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "proofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "proofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "proofInput", "type": "uint256[3]" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address payable", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "poolIndex", "type": "uint256" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
        { "internalType": "address", "name": "token", "type": "address" },
        { "internalType": "uint256", "name": "poolIndex", "type": "uint256" }
    ],
    "name": "getPoolBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "commitments",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ComplianceOracle ABI - for checking if addresses are compliant
export const COMPLIANCE_ORACLE_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isCompliant",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isBlacklisted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isHighRisk",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "isWhitelisted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "blacklistCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// LicitProofVerifier ABI - for checking if deposits are allowed
export const LICIT_PROOF_VERIFIER_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "depositor", "type": "address" }],
    "name": "canDeposit",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "complianceEnabled",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// GaslessRelayer ABI
export const GASLESS_RELAYER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "poolAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "poolIndex", "type": "uint256" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256[2]", "name": "proofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "proofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "proofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "proofInput", "type": "uint256[3]" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "withdrawGasless",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getNonce",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "calculateGaslessFee",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "allowedPoolAmounts",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// PrivateSwapVerifier ABI
export const PRIVATE_SWAP_VERIFIER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256[2]", "name": "proofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "proofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "proofC", "type": "uint256[2]" },
      { "internalType": "uint256[4]", "name": "publicSignals", "type": "uint256[4]" }
    ],
    "name": "verifyPrivateSwap",
    "outputs": [{ "internalType": "bool", "name": "valid", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "commitment", "type": "bytes32" }],
    "name": "isCommitmentUsed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// RangeProofVerifier ABI
export const RANGE_PROOF_VERIFIER_ABI = [
  {
    "inputs": [
      { "internalType": "uint256[2]", "name": "proofA", "type": "uint256[2]" },
      { "internalType": "uint256[2][2]", "name": "proofB", "type": "uint256[2][2]" },
      { "internalType": "uint256[2]", "name": "proofC", "type": "uint256[2]" },
      { "internalType": "uint256[3]", "name": "publicSignals", "type": "uint256[3]" }
    ],
    "name": "verifyRangeProof",
    "outputs": [{ "internalType": "bool", "name": "verified", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "isUserVerified",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "verifiedModeThreshold",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// DIDRegistry ABI
export const DID_REGISTRY_ABI = [
  {
    "inputs": [{ "internalType": "bytes", "name": "signature", "type": "bytes" }],
    "name": "createDID",
    "outputs": [{ "internalType": "string", "name": "did", "type": "string" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "revokeDID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "signature", "type": "bytes" }],
    "name": "renewDID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "hasValidDID",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getDID",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getCredential",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "did", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "expiresAt", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" },
          { "internalType": "bytes32", "name": "credentialHash", "type": "bytes32" }
        ],
        "internalType": "struct DIDRegistry.DIDCredential",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
