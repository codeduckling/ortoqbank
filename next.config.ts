import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'first-bandicoot-132.convex.cloud',
      },
    ],
  },
};

export default nextConfig;
