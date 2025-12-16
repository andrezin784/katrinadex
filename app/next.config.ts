import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export' removido para permitir Edge Functions no Vercel
  // Para build IPFS, use: BUILD_FOR_IPFS=true npm run build
  ...(process.env.BUILD_FOR_IPFS === 'true' ? { output: 'export' } : {}),
  
  images: {
    unoptimized: true, // Obrigatório para IPFS (não há servidor para processar imagens)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Garantir que trailing slashes funcionem bem em gateways IPFS
  trailingSlash: true,
};

export default nextConfig;
