import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Obrigatório para IPFS
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
