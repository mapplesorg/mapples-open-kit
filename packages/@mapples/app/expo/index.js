const fs = require('fs');
const path = require('path');

// The files the `mapples` CLI writes (`mapples sync`) into the app's
// mapplesDir: design tokens, the asset map, and the navigation / API /
// variables documents the behaviour runtime executes. An app that has not
// synced yet resolves to the empty module, so `MapplesApp` falls back to the
// defaults (and an inert runtime) instead of Metro failing on a missing file.
const CLI_FILES = {
  'mapples::style': 'theme.ts',
  'mapples::assets': 'assetMap.ts',
  'mapples::navigation': 'navigation.ts',
  'mapples::api': 'api.ts',
  'mapples::variables': 'variables.ts',
};
const EMPTY = require.resolve('./empty.js');
// mapplesDir of an app linked before the CLI recorded one, or not linked at all.
const DEFAULT_MAPPLES_DIR = 'mapples';

// The folder the CLI writes into, from `.mapples/config.json`'s `mapplesDir`
// (`src/mapples` for apps with `src/app`, else `mapples`), relative to the app
// root Metro runs in. Read once per Metro process: restart Metro after
// changing it.
let mapplesDir;
const readMapplesDir = () => {
  const configPath = path.resolve('.mapples', 'config.json');
  if (!fs.existsSync(configPath)) return DEFAULT_MAPPLES_DIR;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return typeof config.mapplesDir === 'string'
    ? config.mapplesDir
    : DEFAULT_MAPPLES_DIR;
};

const mapplesResolver = (resolver) => (context, moduleName, platform) => {
  const cliFile = CLI_FILES[moduleName];
  if (cliFile) {
    if (mapplesDir === undefined) mapplesDir = readMapplesDir();
    const target = path.resolve(mapplesDir, cliFile);
    return context.resolveRequest(
      context,
      fs.existsSync(target) ? target : EMPTY,
      platform,
    );
  }

  if (resolver) {
    return resolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = { mapplesResolver };
