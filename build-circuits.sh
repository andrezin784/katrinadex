#!/bin/bash
set -e

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$SCRIPT_DIR

echo "📍 Working directory: $ROOT_DIR"

# Add cargo bin to PATH just in case
export PATH="$HOME/.cargo/bin:$PATH"

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ Error: 'circom' is not found in PATH."
    echo "Trying to find it in default cargo location..."
    if [ -f "$HOME/.cargo/bin/circom" ]; then
        echo "Found at $HOME/.cargo/bin/circom"
        alias circom="$HOME/.cargo/bin/circom"
    else
        echo "❌ Still not found. Please ensure 'circom' is installed and in your PATH."
        exit 1
    fi
fi

# Create directories
mkdir -p "$ROOT_DIR/circuits/build"
mkdir -p "$ROOT_DIR/app/public/circuits"

echo "🔧 Compiling Mixer Circuit..."
cd "$ROOT_DIR/circuits/circuits"

# Compile circuit
# Generates: mixer.r1cs, mixer.wasm, mixer.sym
circom mixer.circom --r1cs --wasm --sym --output "$ROOT_DIR/circuits/build"

cd "$ROOT_DIR/circuits/build"

echo "⚡ Generating Trusted Setup (Powers of Tau)..."
# Phase 1: Powers of Tau
# Using bn128 curve, 12 constraints (small for testing, use >14 for prod)
if [ ! -f "pot12_final.ptau" ]; then
    snarkjs powersoftau new bn128 12 pot12_0000.ptau
    snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First Contribution" -v -e="random text"
    snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
    rm pot12_0000.ptau pot12_0001.ptau
else 
    echo "   (Using existing pot12_final.ptau)"
fi

echo "🔑 Generating ZKey (Proving Key)..."
# Phase 2: Circuit Specific Setup
snarkjs groth16 setup mixer.r1cs pot12_final.ptau mixer_0000.zkey
snarkjs zkey contribute mixer_0000.zkey mixer_final.zkey --name="Second Contribution" -v -e="more random text"
snarkjs zkey export verificationkey mixer_final.zkey verification_key.json

echo "📜 Exporting Solidity Verifier..."
snarkjs zkey export solidityverifier mixer_final.zkey "$ROOT_DIR/contracts/src/MixerVerifier.sol"

# Fix solidity version in generated verifier (updates 0.6.11 to ^0.8.0)
# Check if file exists first
if [ -f "$ROOT_DIR/contracts/src/MixerVerifier.sol" ]; then
    # Use perl for cross-platform compatible replacement (sed differences between Linux/macOS)
    perl -i -pe 's/pragma solidity \^0.6.11;/pragma solidity ^0.8.0;/g' "$ROOT_DIR/contracts/src/MixerVerifier.sol"
fi

echo "📦 Copying artifacts to Frontend..."
cp mixer_js/mixer.wasm "$ROOT_DIR/app/public/circuits/"
cp mixer_final.zkey "$ROOT_DIR/app/public/circuits/"
cp verification_key.json "$ROOT_DIR/app/public/circuits/"

echo "✅ DONE! Circuits compiled, keys generated, and verifier contract updated."
