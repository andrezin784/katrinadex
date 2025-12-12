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
