// dist/index.js requires '../assets/<Family>/<file>.ttf' — the relative path
// holds from dist/ exactly as it does from src/, so nothing is copied; this
// only asserts every registered file exists, so a missing font fails the
// build instead of the app at runtime.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const { FONT_FILE_PATHS } = await import(join(root, 'dist', 'manifest.js'));
const missing = Object.values(FONT_FILE_PATHS).filter(
  (path) => !existsSync(join(root, path)),
);
if (missing.length > 0) {
  console.error(`@mapples/fonts: missing font files:\n${missing.join('\n')}`);
  process.exit(1);
}
