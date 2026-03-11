import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@map-planner/ui', '@map-planner/core'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    if (isServer && Array.isArray(config.externals)) {
      config.externals.push('canvas');
    }

    return config;
  },
};

export default nextConfig;
