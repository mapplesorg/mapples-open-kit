// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');

const baseConfig = require('../../../eslint.config');

module.exports = defineConfig([...baseConfig]);
