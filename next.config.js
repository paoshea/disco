// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || '3001',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  webpack: (
    config /** @type {import('webpack').Configuration} */,
    { dev /** @type {boolean} */, isServer /** @type {boolean} */ }
  ) => {
    if (!isServer) {
      // Don't include these packages on the client side
      config.resolve.fallback = {
        fs: false,
        path: false,
        'utf-8-validate': false,
        bufferutil: false,
        'mapbox-gl': false,
        '@mapbox/node-pre-gyp': false,
      };
    }
    // Only run in production build
    if (!dev) {
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        exclude: [
          /node_modules/,
          /__tests__/,
          /\.test\./,
          /\.spec\./,
          /jest\.config\./,
          /jest\.setup\./,
        ],
      });
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
};

module.exports = nextConfig;
