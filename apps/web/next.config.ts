import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  transpilePackages: ['@map-planner/ui', '@map-planner/core'],
};

export default nextConfig;
