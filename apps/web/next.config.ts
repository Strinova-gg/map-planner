import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@map-planner/ui', '@map-planner/core'],
};

export default nextConfig;
