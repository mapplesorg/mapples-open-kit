const fs = require('fs');
const path = require('path');

// The files the `mapples` CLI writes (`mapples sync`) under <app root>/mapples/:
// design tokens, the asset map, and the navigation / API / variables documents
// the behaviour runtime executes. An app that has not synced yet resolves to
// the empty module, so `MapplesApp` falls back to the defaults (and an inert
// runtime) instead of Metro failing on a missing file.
const CLI_FILES = {
  'mapples::style': 'mapples/theme.ts',
  'mapples::assets': 'mapples/assetMap.ts',
  'mapples::navigation': 'mapples/navigation.ts',
  'mapples::api': 'mapples/api.ts',
  'mapples::variables': 'mapples/variables.ts',
};
const EMPTY = require.resolve('./empty.js');

const mapplesResolver = (resolver) => (context, moduleName, platform) => {
  const cliFile = CLI_FILES[moduleName];
  if (cliFile) {
    const target = path.resolve(cliFile);
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
