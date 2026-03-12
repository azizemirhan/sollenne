import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output: 'export' - API routes ile çalışmaz */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
