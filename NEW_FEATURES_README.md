# KatrinaDEX - New Privacy Features

## 🚀 Three Major Upgrades

This update adds three high-priority privacy and security features:

1. **ZK-SNARKs for Private Swaps**
2. **Formal Verification (Slither + Certora)**
3. **Decentralized Identity (DID) + Range Proofs**

---

## 1. ZK-SNARKs Private Swap

### How It Works
- **Client-side proof generation** using Circom + SnarkJS (<3 seconds)
- Proves swap validity **without revealing amount or addresses**
- Contract only verifies the proof (low gas: <100k)

### Frontend Toggle
Enable "Private Swap" in the swap interface to:
- Hide the exact swap amount
- Hide sender/receiver addresses
- Generate ZK proof locally in browser

### Files
```
circuits/circuits/privateSwap.circom    # ZK circuit
contracts/src/PrivateSwapVerifier.sol   # On-chain verifier
app/src/lib/privateSwap.ts              # Client-side proof generation
app/src/components/PrivateSwapToggle.tsx
```

### Test Private Swap
```bash
# Build circuits (run once)
cd circuits && ./build-all.sh

# Test in browser
npm run dev
# Navigate to /swap, enable "Private Swap" toggle
```

---

## 2. Formal Verification

### Slither (Security Analysis)
Runs automatically on push/PR to `main` or `develop`.

```yaml
# .github/workflows/slither.yml
- Detects: reentrancy, overflow, unchecked calls
- Fails on: HIGH severity issues
- Generates: SARIF report for GitHub Security tab
```

### Certora (Formal Proofs)
Mathematical verification of contract invariants.

```yaml
# .github/workflows/certora.yml
Verifies:
- Mixer: nullifier uniqueness, no double-spend
- Relayer: CEI pattern, correct fees
- DIDRegistry: ownership, expiration logic
```

### Running Locally
```bash
# Slither
pip install slither-analyzer
cd contracts && slither src/ --config-file slither.config.json

# Certora (requires API key)
pip install certora-cli
export CERTORAKEY=your_key
cd contracts && certoraRun certora/conf/Mixer.conf
```

### Files
```
.github/workflows/slither.yml
.github/workflows/certora.yml
contracts/slither.config.json
contracts/certora/specs/Mixer.spec
contracts/certora/specs/Relayer.spec
contracts/certora/specs/DIDRegistry.spec
```

---

## 3. Decentralized Identity (DID) + Range Proofs

### DID System
- **did:pkh** format compatible with SpruceID
- Sign with wallet to create identity
- Required for swaps above threshold (Verified Mode)

### Range Proofs
- Prove "balance > X" without revealing exact balance
- ZK circuit generates proof client-side
- Used to verify solvency for large swaps

### Frontend "Verified Mode"
When swap amount exceeds threshold:
1. User sees "Verification Required" warning
2. Click "Verify Identity" to sign DID
3. Optionally prove balance with range proof
4. Proceed with swap

### Files
```
contracts/src/DIDRegistry.sol           # On-chain DID registry
contracts/src/RangeProofVerifier.sol    # Range proof verifier
circuits/circuits/rangeProof.circom     # ZK range proof circuit
app/src/lib/did.ts                      # DID utilities
app/src/lib/rangeProof.ts               # Range proof generation
app/src/components/VerifiedModeToggle.tsx
```

### Test DID
```bash
# In browser console after connecting wallet:
# DID will be created on first large swap attempt
# Or manually in developer tools
```

---

## 📦 Deployment

### Contracts
```bash
cd contracts

# Deploy to Base Sepolia
forge script script/DeployPrivateSwap.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast

# Deploy to Arc Testnet (when RPC available)
forge script script/DeployPrivateSwap.s.sol --rpc-url $ARC_RPC --broadcast
```

### Frontend
```bash
cd app
npm install
npm run build
# Deploy via Vercel (automatic on push to main)
```

### Build Circuits
```bash
cd circuits
npm install
chmod +x build-all.sh
./build-all.sh
```

---

## 🔐 Security Considerations

### Gas Costs
| Operation | Gas |
|-----------|-----|
| Private Swap Verify | ~80,000 |
| Range Proof Verify | ~70,000 |
| DID Create | ~50,000 |

### Client Performance
| Proof | Time (M4) | Time (Mobile) |
|-------|-----------|---------------|
| Private Swap | ~1.5s | ~2.5s |
| Range Proof | ~1.0s | ~2.0s |

### CEI Pattern
All contracts follow Checks-Effects-Interactions:
- State updated before external calls
- ReentrancyGuard on sensitive functions
- Verified by Certora specs

---

## 🔄 Rollback

If issues occur after deployment:

```bash
# Emergency rollback
./rollback-emergency-enhanced.sh

# Select backup and confirm
git push origin main --force

# Vercel auto-deploys previous version
```

---

## 🧪 Testing

### Unit Tests
```bash
cd contracts
forge test -vvv
```

### Integration Tests
```bash
cd app
npm run test
```

### E2E Tests
```bash
# Start local node
cd contracts && anvil

# Deploy locally
forge script script/DeployKatrinaDEX.s.sol --rpc-url http://localhost:8545 --broadcast

# Run frontend
cd app && npm run dev

# Test in browser at http://localhost:3000
```

---

## 📊 Monitoring

### Slither Results
Check GitHub Actions → Security tab

### Certora Dashboard
https://prover.certora.com (requires login)

### Transaction Monitoring
- Base Sepolia: https://sepolia.basescan.org
- Arc Testnet: (explorer TBD)

---

## 🔗 Resources

- [Circom Docs](https://docs.circom.io/)
- [SnarkJS](https://github.com/iden3/snarkjs)
- [Slither](https://github.com/crytic/slither)
- [Certora](https://www.certora.com/)
- [did:pkh Spec](https://github.com/w3c-ccg/did-pkh)

---

## ⚠️ Notes

- **Homomorphic Encryption**: Not included (too heavy for browser)
- **Arc Testnet**: Deploy when RPC is available
- **Production**: Replace test zkeys with trusted setup ceremony

