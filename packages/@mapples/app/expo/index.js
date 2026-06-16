const fs = require('fs');
const path = require('path');

const mapplesResolver = (resolver) => (context, moduleName, platform) => {
  if (moduleName === 'mapples::style') {
    const config = JSON.parse(
      fs.readFileSync(path.resolve('./.mapplesrc.json'), 'utf-8'),
    );
    const stylePath = path.resolve(
      `./${config.sourceDir}/${config.dirs.style}/style.json`,
    );

    return context.resolveRequest(context, stylePath, platform);
  }

  if (moduleName === 'mapples::assets') {
    const config = JSON.parse(
      fs.readFileSync(path.resolve('./.mapplesrc.json'), 'utf-8'),
    );
    const assetsPath = path.resolve(
      `./${config.sourceDir}/${config.dirs.assets}/assetMap`,
    );

    return context.resolveRequest(context, assetsPath, platform);
  }

  if (moduleName === 'mapples::navigation') {
    const config = JSON.parse(
      fs.readFileSync(path.resolve('./.mapplesrc.json'), 'utf-8'),
    );
    const navigationMap = path.resolve(
      `./${config.sourceDir}/${config.dirs.navigation}/navigationMap`,
    );

    return context.resolveRequest(context, navigationMap, platform);
  }

  if (resolver) {
    return resolver(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = { mapplesResolver };
