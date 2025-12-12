import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  baseSepolia,
  base,
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from 'wagmi/chains';
import { cookieStorage, createStorage, http } from 'wagmi';

const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  iconUrl: '/chains/arc.svg',
  iconBackground: '#1E4A7D',
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'KatrinaDEX',
  projectId: '04309ed1007e77d1f119b85205bb779d',
  chains: [
    arcTestnet,
    baseSepolia,
    base,
    mainnet,
    polygon,
    optimism,
    arbitrum,
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [arcTestnet.id]: http(),
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});
