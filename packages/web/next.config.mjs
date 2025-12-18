import { AlphaTabWebPackPlugin } from "@coderline/alphatab/webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@metalmaster/shared-validation",
    "@metalmaster/shared-types",
    "@metalmaster/shared-schemas",
  ],
  webpack(config) {
    config.plugins.push(new AlphaTabWebPackPlugin());
    return config;
  },
};

export default nextConfig;
