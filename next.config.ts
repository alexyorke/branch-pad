import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  // Get the repository name from the environment or use a default
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Disable image optimization since it requires a server component
  images: {
    unoptimized: true,
  },
  // Ensure assets are loaded with the correct path
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  // Ensure trailing slashes are handled consistently
  trailingSlash: true,
};

export default nextConfig;
