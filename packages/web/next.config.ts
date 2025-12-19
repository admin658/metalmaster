import { AlphaTabWebPackPlugin } from '@coderline/alphatab/webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@metalmaster/shared-validation',
    '@metalmaster/shared-types',
    '@metalmaster/shared-schemas',
  ],
  webpack(config) {
    config.plugins.push(
      new AlphaTabWebPackPlugin({
        assetOutputDir: 'public/alphatab',
      })
    );
    return config;
  },
};

export default nextConfig;
