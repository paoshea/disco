
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || '3000',
  },
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  webpack: (
    config,
    { isServer }
  ) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bcrypt: false,
        'mock-aws-s3': false,
        'aws-sdk': false,
        nock: false,
        '@mapbox/node-pre-gyp': false,
      };
    }
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
        source: '/:path*',
        headers: [
          { key: 'Set-Cookie', value: 'SameSite=None; Secure' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
