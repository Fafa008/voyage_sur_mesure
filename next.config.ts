import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@hugeicons/react", "lucide-react"],
  },
  serverExternalPackages: ["@prisma/client", "bcrypt"],
};

export default nextConfig;
