// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const importConfig = require('eslint-plugin-import');

// Node/CommonJS globals available to build & tooling config files.
const nodeConfigGlobals = {
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  exports: 'writable',
  module: 'writable',
  process: 'readonly',
  require: 'readonly',
};

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  importConfig.flatConfigs.recommended,
  importConfig.flatConfigs.warnings,
  importConfig.flatConfigs.typescript,
  {
    // Build output, in every workspace — `dist/*` only ever matched the repo
    // root, so packages were linting their own compiled JavaScript.
    ignores: ['**/dist/**'],
  },
  {
    // Build/tooling config files run in Node as CommonJS.
    files: ['**/*.config.js', '**/*.config.*.js', '**/*.config_example.js'],
    languageOptions: {
      globals: nodeConfigGlobals,
      sourceType: 'commonjs',
    },
  },
  {
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          project: [
            'apps/*/tsconfig.json',
            'packages/@mapples/*/tsconfig.json',
            'packages/@mapplesorg/*/tsconfig.json',
          ],
        },
      },
    },
  },
  {
    rules: {
      'import/no-named-as-default-member': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
