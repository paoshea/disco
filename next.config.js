// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  output: 'standalone',
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || '3001',
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  webpack: (
    config /** @type {import('webpack').Configuration} */,
    { isServer /** @type {boolean} */ }
  ) => {
    if (!isServer) {
      // Don't include these packages on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcrypt: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        nock: false,
        '@mapbox/node-pre-gyp': false,
      };
    }
    // Resolve path aliases
    const path = require('path');
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './src'),
      },
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*', // This applies to all routes.  Consider more specific routes.
        headers: [
          { key: 'Set-Cookie', value: 'SameSite=None; Secure' }, //Consider more specific cookies.
        ],
      },
    ];
  },
};

module.exports = nextConfig;
