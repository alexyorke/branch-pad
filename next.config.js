/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the Pages export settings in the JavaScript config that Next.js loads.
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // Add a rule for handling Monaco Editor's web workers
    config.module.rules.push({
      test: /monaco-editor[/\\]esm[/\\]vs[/\\]editor[/\\]editor.(worker|background)\.js$/,
      use: ['worker-loader'],
    });

    return config;
  },
  // Allow loading Monaco Editor from CDN
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 