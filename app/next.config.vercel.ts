import type { NextConfig } from "next";

/**
 * Configuração Next.js para Vercel (com suporte a Edge Functions)
 * 
 * Esta config permite Edge Functions no Vercel enquanto mantém
 * compatibilidade com IPFS quando necessário.
 */
const nextConfig: NextConfig = {
  // Remover output: 'export' para permitir Edge Functions no Vercel
  // output: 'export', // Comentado para Vercel
  
  images: {
    unoptimized: true, // Mantido para compatibilidade
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  
  // Configurações específicas para Edge Functions
  experimental: {
    // Garantir que Edge Functions funcionem
  },
};

export default nextConfig;

