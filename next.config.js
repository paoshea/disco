/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || '3001',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    runtime: 'nodejs', // Specify Node.js runtime
  },
  webpack: (config, { isServer }) => {
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
    return config;
  },
};

module.exports = nextConfig;
