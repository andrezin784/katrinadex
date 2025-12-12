// ETH Official Logo - from TrustWallet token list
export const EthIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
    alt="ETH"
    className={`w-6 h-6 rounded-full ${className || ''}`}
  />
);

// USDC Official Logo - from Uniswap/TrustWallet token list
export const UsdcIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
    alt="USDC"
    className={`w-6 h-6 rounded-full ${className || ''}`}
  />
);

// EURC (Euro Coin) Official Logo - from Circle/TrustWallet
export const EurcIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c/logo.png"
    alt="EURC"
    className={`w-6 h-6 rounded-full ${className || ''}`}
  />
);
