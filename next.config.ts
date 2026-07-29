import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@hugeicons/react", "lucide-react"],
  },
  serverExternalPackages: ["@prisma/client", "bcrypt"],
  images: {
    // Conversion automatique en AVIF puis WebP — réduit le poids des images de 40-60%
    formats: ["image/avif", "image/webp"],
    // Autoriser les URLs externes stockées en base de données
    // ⚠️ À restreindre au domaine de votre CDN/stockage avant la mise en production
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
