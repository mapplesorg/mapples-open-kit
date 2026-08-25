// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');

const baseConfig = require('../../../eslint.config');

module.exports = defineConfig([
  ...baseConfig,
  {
    // Node ESM build scripts (import.meta, top-level await).
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
]);
