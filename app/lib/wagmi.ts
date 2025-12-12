import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base,
  mainnet,
  polygon,
  optimism,
  arbitrum,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'KatrinaDEX',
  projectId: 'katrina-dex-privacy-mixer-2025', // This is a placeholder - use a real project ID
  chains: [
    base,
    mainnet,
    polygon,
    optimism,
    arbitrum,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
