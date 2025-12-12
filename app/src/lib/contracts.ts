// KatrinaDEX Contract Addresses - Multi-chain Support

export const CONTRACTS_CONFIG = {
  84532: {
    name: 'Base Sepolia',
    COMPLIANCE_ORACLE: '0x0000000000000000000000000000000000000000', // TODO: Update after deploy
    MIXER_VERIFIER: '0x0b1e0846c410e81E1901f58032805FE7D8119E66',
    LICIT_PROOF_VERIFIER: '0xF8061fFd76F27ca74294B943c0150751Ed881898',
    MIXER: '0x46f123107B2E4f9042de8c6Fb8762f8824ef90f4',
    RELAYER: '0x86F4303D695fF43210049EDD49bCaeE99f45810e',
    USDC: '0xA0b86a33E6441e88C5F2712C3e9b74B6e44e8e77',
    ETH_ADDRESS: '0x0000000000000000000000000000000000000000',
  },
  5042002: {
    name: 'Arc Testnet',
    COMPLIANCE_ORACLE: '0x7C3A70235F1FC08b82c9e53078aAf0a99CDDf386',
    MIXER_VERIFIER: '0xF53F0115dd476fab6Bf3F58B33Ad6f88402f23C7',
    LICIT_PROOF_VERIFIER: '0xD3CfF6CB9308d6e20E2c07d6258491e8e019cFff',
    MIXER: '0x3441cF331Cb75c6BBCa7a34718224C7983eF4636',
    RELAYER: '0xD29eA0dAcb69b3e7bd6F3774C1AE24f058ee7851',
    USDC: '0x3600000000000000000000000000000000000000', // USDC nativo (18 decimals)
    EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a', // EURC ERC20 (6 decimals)
    ETH_ADDRESS: '0x0000000000000000000000000000000000000000',
  },
} as const;

// Default export for backward compatibility (defaults to Base Sepolia)
export const CONTRACTS = CONTRACTS_CONFIG[84532];

// Pool sizes in wei - Base Sepolia (default)
export const POOL_SIZES = {
  ETH: [
    { value: '10000000000000000', label: '0.01 ETH', index: 0 },
    { value: '100000000000000000', label: '0.1 ETH', index: 1 },
    { value: '500000000000000000', label: '0.5 ETH', index: 2 },
    { value: '1000000000000000000', label: '1 ETH', index: 3 },
    { value: '5000000000000000000', label: '5 ETH', index: 4 },
  ],
  USDC: [
    { value: '10000000', label: '10 USDC', index: 0 },
    { value: '100000000', label: '100 USDC', index: 1 },
    { value: '500000000', label: '500 USDC', index: 2 },
    { value: '1000000000', label: '1,000 USDC', index: 3 },
    { value: '5000000000', label: '5,000 USDC', index: 4 },
    { value: '10000000000', label: '10,000 USDC', index: 5 },
  ],
  EURC: [] as { value: string; label: string; index: number }[],
} as const;

// Arc Testnet Pool sizes (USDC native has 18 decimals, EURC has 6 decimals)
// On Arc, "ETH" represents the native USDC token
// "USDC" option is hidden since native USDC uses depositETH function
export const POOL_SIZES_ARC = {
  ETH: [
    { value: '10000000000000000000', label: '10 USDC', index: 0 },      // 10 * 10^18
    { value: '100000000000000000000', label: '100 USDC', index: 1 },    // 100 * 10^18
    { value: '1000000000000000000000', label: '1,000 USDC', index: 2 }, // 1000 * 10^18
    { value: '10000000000000000000000', label: '10,000 USDC', index: 3 }, // 10000 * 10^18
  ],
  // USDC pools are not available on Arc (native token uses depositETH)
  USDC: [] as { value: string; label: string; index: number }[],
  EURC: [
    { value: '10000000', label: '10 EURC', index: 0 },
    { value: '100000000', label: '100 EURC', index: 1 },
    { value: '500000000', label: '500 EURC', index: 2 },
    { value: '1000000000', label: '1,000 EURC', index: 3 },
    { value: '5000000000', label: '5,000 EURC', index: 4 },
    { value: '10000000000', label: '10,000 EURC', index: 5 },
  ],
} as const;

// Helper function to get pool sizes for a chain
export function getPoolSizes(chainId: number) {
  if (chainId === 5042002) {
    return POOL_SIZES_ARC;
  }
  return POOL_SIZES;
}

// Chain info
export const CHAIN = {
  id: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  explorer: 'https://sepolia.basescan.org',
} as const;

// Protocol fee: 0.3%
export const PROTOCOL_FEE_BPS = 30; // 0.3%
export const RELAYER_FEE_BPS = 10; // 0.1%

// Owner address (receives protocol fees)
export const PROTOCOL_OWNER = '0x4d149a54658d310c9487671d868a4ce0b6fded96' as const;
