import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  serverExternalPackages: ["@prisma/client", "bcrypt"],
  images: {
    // Conversion automatique en AVIF puis WebP — réduit le poids des images de 40-60%
    formats: ["image/avif", "image/webp"],
    // Autoriser les URLs externes stockées en base de données
    // Restreint aux domaines approuvés pour la sécurité
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.APP_URL ? new URL(process.env.APP_URL).hostname : "monvoyage.com",
      },
    ],
  },
};

export default nextConfig;
