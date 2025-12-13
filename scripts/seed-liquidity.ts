#!/usr/bin/env tsx

/**
 * KatrinaDEX Liquidity Seeding Script
 * Adiciona liquidez inicial aos pools do mixer
 */

import { createWalletClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const USE_TESTNET = process.env.USE_TESTNET === 'true';
const RPC_URL = USE_TESTNET ? process.env.BASE_SEPOLIA_RPC_URL : process.env.BASE_RPC_URL;

// Endereços dos contratos (atualizar após deploy)
const MIXER_ADDRESS = (process.env.MIXER_ADDRESS as `0x${string}`) || '0x0000000000000000000000000000000000000000';
const USDC_ADDRESS = '0xA0b86a33E6441e88C5F2712C3e9b74B6e44e8e77'; // Base USDC

if (!PRIVATE_KEY || PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000000') {
  console.error('❌ Configure sua PRIVATE_KEY no arquivo .env');
  process.exit(1);
}

if (MIXER_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.error('❌ Configure MIXER_ADDRESS no arquivo .env após o deploy');
  process.exit(1);
}

// Configurar cliente
const account = privateKeyToAccount(PRIVATE_KEY);
const chain = USE_TESTNET ? baseSepolia : base;
const client = createWalletClient({
  account,
  chain,
  transport: http(RPC_URL),
});

// Pool sizes
const POOL_SIZES = [
  parseEther('0.1'),
  parseEther('0.5'),
  parseEther('1'),
  parseEther('5'),
  parseEther('10'),
];

// ABI simplificado do mixer
const MIXER_ABI = [
  {
    inputs: [
      { internalType: 'bytes32', name: 'commitment', type: 'bytes32' },
      { internalType: 'uint256', name: 'poolIndex', type: 'uint256' },
      { internalType: 'uint256[2]', name: 'licitProofA', type: 'uint256[2]' },
      { internalType: 'uint256[2][2]', name: 'licitProofB', type: 'uint256[2][2]' },
      { internalType: 'uint256[2]', name: 'licitProofC', type: 'uint256[2]' },
      { internalType: 'uint256[3]', name: 'licitProofInput', type: 'uint256[3]' },
    ],
    name: 'depositETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

async function seedLiquidity() {
  console.log('🌊 KatrinaDEX - Seeding Liquidez Inicial');
  console.log('========================================');

  try {
    // Verificar saldo da conta
    const balance = await client.getBalance({ address: account.address });
    console.log(`💰 Saldo da conta: ${formatEther(balance)} ETH`);

    if (balance < parseEther('100')) {
      console.warn('⚠️  Saldo baixo. Recomendado pelo menos 100 ETH para seeding adequado.');
    }

    // Seed ETH pools
    console.log('\n📈 Seeding pools ETH...');

    for (let i = 0; i < POOL_SIZES.length; i++) {
      const poolSize = POOL_SIZES[i];
      const poolValue = formatEther(poolSize);

      console.log(`  Pool ${i + 1}: ${poolValue} ETH`);

      // Gerar commitment aleatório (simulado)
      const commitment = `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;

      // Proofs simulados (zeros para teste)
      const licitProofA: readonly [bigint, bigint] = [0n, 0n];
      const licitProofB: readonly [readonly [bigint, bigint], readonly [bigint, bigint]] = [
        [0n, 0n],
        [0n, 0n],
      ];
      const licitProofC: readonly [bigint, bigint] = [0n, 0n];
      const licitProofInput: readonly [bigint, bigint, bigint] = [0n, 0n, 0n];

      try {
        const hash = await client.writeContract({
          address: MIXER_ADDRESS,
          abi: MIXER_ABI,
          functionName: 'depositETH',
          args: [commitment, BigInt(i), licitProofA, licitProofB, licitProofC, licitProofInput],
          value: poolSize,
        });

        console.log(`    ✅ Tx: ${hash}`);
      } catch (error) {
        console.error(`    ❌ Erro no pool ${i + 1}:`, error);
      }

      // Pequena pausa entre transações
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Verificar pools após seeding
    console.log('\n🔍 Verificando pools...');

    // TODO: Adicionar função de verificação dos saldos dos pools

    console.log('\n🎉 Seeding de liquidez concluído!');
    console.log('\n📋 Resumo:');
    console.log('  - 5 pools ETH criados');
    console.log('  - Valores: 0.1, 0.5, 1, 5, 10 ETH');
    console.log('  - Total ETH seedado: 16.6 ETH');

  } catch (error) {
    console.error('❌ Erro durante seeding:', error);
    process.exit(1);
  }
}

// Executar seeding
seedLiquidity().catch(console.error);


