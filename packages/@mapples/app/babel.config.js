// Babel config used only by Jest to transpile TypeScript test sources.
// The package itself is built with `tsc` (see tsconfig.build.json).
module.exports = {
  presets: ['@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-modules-commonjs'],
};
