module.exports = {
  plugins: ['@babel/plugin-syntax-import-attributes'],
  env: {
    test: {
      presets: [
        '@babel/preset-env',
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
    },
  },
};
