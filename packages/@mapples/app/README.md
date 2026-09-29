# @mapples/app

A React Native component library that provides the core Mapples ecosystem functionality. This package includes the main MapplesApp component and utility functions for asset management and font loading.

## Features

- 🚀 **Core Mapples Integration**: Main entry point for the Mapples ecosystem
- 📱 **Font Loading**: Automatic font loading with expo-font integration
- 🎨 **Style Provider**: Built-in styling system integration
- 🧩 **Render Provider**: Dynamic component rendering capabilities
- 📦 **Asset Management**: Utility functions for processing Mapples asset references
- 🔧 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- ⚛️ **React Integration**: Seamless integration with React Native applications

## Installation

```bash
npm install @mapples/app
# or
yarn add @mapples/app
```

## Usage

### Basic Setup

Wrap your app with the `MapplesApp` component to enable the Mapples ecosystem:

```tsx
import React from 'react';
import MapplesApp from '@mapples/app';

function App() {
  return <MapplesApp>{/* Your app components */}</MapplesApp>;
}

export default App;
```

### With Custom Configuration

```tsx
import React from 'react';
import MapplesApp from '@mapples/app';

function App() {
  return (
    <MapplesApp
      showFontLoadingIndicator={true}
      FontLoadingIndicator={<LoadingSpinner />}
    >
      {/* Your app components */}
    </MapplesApp>
  );
}

export default App;
```

### With Custom Assets and Styles

```tsx
import React from 'react';
import MapplesApp from '@mapples/app';

const customAssets = {
  'ref(font:123:CustomFont.ttf)': require('./fonts/CustomFont.ttf'),
  'ref(image:456:logo.png)': require('./images/logo.png'),
};

const customStyle = {
  // Your custom style configuration
};

function App() {
  return (
    <MapplesApp assets={customAssets} style={customStyle}>
      {/* Your app components */}
    </MapplesApp>
  );
}

export default App;
```

## API Reference

### MapplesApp

The main component that provides the core Mapples ecosystem functionality.

**Props:**

- `children` - Child components
- `style?` - Optional custom style configuration to override the default Mapples styling
- `assets?` - Optional custom assets configuration to override the default Mapples assets
- `navigation?` - Optional `NavigationMap` (Mapples action `routeName` → expo-router href) consumed by `useNavigationActions`
- `showFontLoadingIndicator?` - Whether to show a loading indicator while fonts are loading
- `FontLoadingIndicator?` - Custom loading indicator component to display while fonts are loading

**Example:**

```tsx
<MapplesApp
  showFontLoadingIndicator={true}
  FontLoadingIndicator={<ActivityIndicator size="large" />}
>
  <YourAppContent />
</MapplesApp>
```

### Navigation

`@mapples/app` bridges Mapples **navigation** actions (`mapples:navigate`,
`mapples:switchTab`, `mapples:goBack`, `mapples:openDrawer`,
`mapples:closeDrawer`) to [expo-router](https://docs.expo.dev/router/introduction/).

Pass the generated `NavigationMap` (default-exported from the
`mapples navigation sync`–generated `navigationMap.ts`) into `MapplesApp` via the
`navigation` prop, mirroring `assets` and `style`:

```tsx
import MapplesApp from '@mapples/app';
import navigationMap from '../navigation/navigationMap';

<MapplesApp style={style} assets={assets} navigation={navigationMap}>
  <YourAppContent />
</MapplesApp>;
```

Generated route wrappers consume it through `useNavigationActions`, composing the
result into the Mapplet's `onAction` for the navigation subset:

```tsx
import { useNavigationActions } from '@mapples/app';

const onNavigation = useNavigationActions();
// onNavigation(action) → router.push / router.back / OPEN_DRAWER / CLOSE_DRAWER
```

`useNavigationActions` reads the `NavigationMap` from context and dispatches via
expo-router's `useRouter` + `useNavigation`. Unknown action types and unmapped
`routeName`s are no-ops.

#### Peer dependency: `expo-router`

`useNavigationActions` depends on `expo-router`, declared as an **optional peer
dependency**. Apps that use Mapples navigation already depend on `expo-router`;
non-navigation apps are not forced to install it because the hook is only ever
imported from generated route wrappers (which render inside the router context).

```bash
yarn add expo-router   # only if your app uses Mapples navigation
```

### Utility Functions

#### `normalizeKey(key)`

Normalizes a reference key by extracting type, id, and name information.

**Parameters:**

- `key` - The reference key to normalize, either in `ref(type:id:name)` format or a plain string

**Returns:**

- An object containing the parsed type, id, and normalized name, or undefined if the key format is invalid

**Example:**

```typescript
import { normalizeKey } from '@mapples/app';

const result = normalizeKey('ref(font:123:MyFont.ttf)');
// Returns: { type: 'font', id: '123', name: 'MyFont' }
```

#### `remapFonts(assets)`

Remaps font assets from the Mapples asset configuration format to a format compatible with expo-font.

**Parameters:**

- `assets` - The assets configuration object containing font references

**Returns:**

- A new object containing only the font assets in expo-font compatible format

**Example:**

```typescript
import { remapFonts } from '@mapples/app';

const assets = {
  'ref(font:123:MyFont.ttf)': require('./fonts/MyFont.ttf'),
  'ref(image:456:logo.png)': require('./images/logo.png'),
};

const fonts = remapFonts(assets);
// Returns: { MyFont: require('./fonts/MyFont.ttf') }
```

## Advanced Usage

### Custom Font Loading

```tsx
import React from 'react';
import MapplesApp, { remapFonts } from '@mapples/app';

const customAssets = {
  'ref(font:123:CustomFont.ttf)': require('./fonts/CustomFont.ttf'),
  'ref(font:124:AnotherFont.ttf)': require('./fonts/AnotherFont.ttf'),
};

function App() {
  return (
    <MapplesApp assets={customAssets}>
      <YourAppContent />
    </MapplesApp>
  );
}
```

### Asset Processing

```tsx
import { normalizeKey, remapFonts } from '@mapples/app';

// Process individual asset keys
const assetKey = 'ref(font:123:MyFont.ttf)';
const normalized = normalizeKey(assetKey);
console.log(normalized); // { type: 'font', id: '123', name: 'MyFont' }

// Process entire asset configuration
const assets = {
  'ref(font:123:MyFont.ttf)': require('./fonts/MyFont.ttf'),
  'ref(image:456:logo.png)': require('./images/logo.png'),
};

const fonts = remapFonts(assets);
console.log(fonts); // { MyFont: require('./fonts/MyFont.ttf') }
```

### Integration with Other Mapples Packages

The MapplesApp component automatically integrates with other Mapples packages:

```tsx
import React from 'react';
import MapplesApp from '@mapples/app';
import { useForm } from '@mapples/form';
import { useDnD } from '@mapples/dnd';

function App() {
  return (
    <MapplesApp>
      <FormExample />
      <DnDExample />
    </MapplesApp>
  );
}

function FormExample() {
  const form = useForm();
  // Form functionality is available
  return <div>Form content</div>;
}

function DnDExample() {
  const { isDragging } = useDnD();
  // Drag and drop functionality is available
  return <div>DnD content</div>;
}
```

## TypeScript Support

This package is written in TypeScript and provides full type safety. All APIs are documented with TSDoc comments for excellent IDE support and IntelliSense.

### Type Definitions

```typescript
interface MapplesAppProps {
  style?: StyleContextType;
  assets?: AnyObject;
  showFontLoadingIndicator?: boolean;
  FontLoadingIndicator?: JSX.Element;
}
```

## Best Practices

1. **Always wrap your app**: Use MapplesApp as the root component to ensure all Mapples functionality is available

2. **Font loading**: Consider using `showFontLoadingIndicator` for better user experience during font loading

3. **Asset organization**: Keep your asset references organized and use the utility functions for processing

4. **Performance**: The component handles font loading efficiently and only re-renders when necessary

5. **Testing**: Test your app with different asset configurations to ensure proper loading

## Metro Configuration

`MapplesApp` reads the files the [`mapples` CLI](https://www.npmjs.com/package/mapples) writes on `mapples sync`: `mapples/theme.ts` (design tokens) and `mapples/assetMap.ts` (bundled assets with their metadata). `mapplesResolver` maps the `mapples::style` and `mapples::assets` imports to those files — or to an empty module before the first sync, so the app renders with the defaults. Add it to your `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { mapplesResolver } = require('@mapples/app/expo');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = mapplesResolver(
  (context, moduleName, platform) => {
    // add your custom resolvers here
    return context.resolveRequest(context, moduleName, platform);
  },
);

module.exports = config;
```

No `.mapplesrc.json` is needed. Navigation comes from the expo-router layouts the CLI generates; the `navigation` prop is only for a hand-wired action map.

## Development

### Building the Package

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please ensure that:

1. All new APIs include comprehensive TSDoc documentation
2. TypeScript types are properly defined
3. Tests are added for new functionality
4. The README is updated for any new features

## License

MIT License - see LICENSE file for details.

## Author

Oleksandr Soloviov - [mapples.org](https://mapples.org/people/olek_soloviov)
