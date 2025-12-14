#!/bin/bash

# Build All ZK Circuits for KatrinaDEX
# Compiles: mixer, privateSwap, rangeProof

set -e

echo "🔨 Building ZK Circuits..."
echo "=========================="

cd "$(dirname "$0")"

# Create build directory
mkdir -p build

# Download Powers of Tau if not exists
if [ ! -f "powersOfTau28_hez_final_14.ptau" ]; then
    echo "📥 Downloading Powers of Tau..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau -o powersOfTau28_hez_final_14.ptau
fi

# Function to build a circuit
build_circuit() {
    local circuit_name=$1
    echo ""
    echo "🔧 Building $circuit_name..."
    
    # Compile circuit
    circom circuits/$circuit_name.circom --r1cs --wasm --sym -o build
    
    # Generate zkey (Groth16)
    echo "🔑 Generating zkey for $circuit_name..."
    snarkjs groth16 setup build/$circuit_name.r1cs powersOfTau28_hez_final_14.ptau build/${circuit_name}_0000.zkey
    
    # Export verification key
    snarkjs zkey export verificationkey build/${circuit_name}_0000.zkey build/${circuit_name}_verification_key.json
    
    # Generate Solidity verifier
    snarkjs zkey export solidityverifier build/${circuit_name}_0000.zkey build/${circuit_name}_verifier.sol
    
    # Copy final zkey
    cp build/${circuit_name}_0000.zkey build/${circuit_name}_final.zkey
    
    echo "✅ $circuit_name built successfully!"
}

# Build all circuits
build_circuit "mixer"
build_circuit "privateSwap"
build_circuit "rangeProof"

echo ""
echo "📦 Copying WASM and zkey files to public folder..."
mkdir -p ../app/public/circuits

# Copy WASM files
cp build/mixer_js/mixer.wasm ../app/public/circuits/
cp build/privateSwap_js/privateSwap.wasm ../app/public/circuits/
cp build/rangeProof_js/rangeProof.wasm ../app/public/circuits/

# Copy zkey files
cp build/mixer_final.zkey ../app/public/circuits/
cp build/privateSwap_final.zkey ../app/public/circuits/
cp build/rangeProof_final.zkey ../app/public/circuits/

echo ""
echo "✅ All circuits built and copied to public folder!"
echo ""
echo "📊 Circuit Stats:"
echo "   - mixer.wasm: $(du -h ../app/public/circuits/mixer.wasm 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - privateSwap.wasm: $(du -h ../app/public/circuits/privateSwap.wasm 2>/dev/null | cut -f1 || echo 'N/A')"
echo "   - rangeProof.wasm: $(du -h ../app/public/circuits/rangeProof.wasm 2>/dev/null | cut -f1 || echo 'N/A')"

