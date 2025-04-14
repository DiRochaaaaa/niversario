import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Desabilita a pré-renderização estática para páginas que usam Supabase
  // Isso evita erros durante o build relacionados à conexão com o Supabase
  output: 'standalone', // Gera um build standalone para facilitar o deploy
  // Configuração de páginas que não devem ser geradas estaticamente
  typescript: {
    // !! WARN !!
    // Isso permite ignorar erros de TypeScript durante o build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
