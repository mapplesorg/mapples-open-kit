# @mapples/app

A powerful Expo plugin for the Mapples ecosystem that provides essential app configuration and utilities. This package includes a "Hello World" plugin that demonstrates how to extend Expo's configuration system.

## Features

- 🚀 **Expo Plugin System**: Built-in Expo plugin for app configuration
- 📱 **Cross-Platform Support**: Works with both iOS and Android
- 🔧 **Configurable**: Customizable plugin options
- 📘 **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎯 **Mapples Integration**: Seamlessly integrates with the Mapples ecosystem

## Installation

```bash
npm install @mapples/app
# or
yarn add @mapples/app
```

## Quick Start

### 1. Add to app.json/app.config.js

Add the plugin to your Expo configuration:

```json
{
  "expo": {
    "name": "My App",
    "plugins": [
      [
        "@mapples/app",
        {
          "message": "Hello from my app!",
          "enableLogging": true
        }
      ]
    ]
  }
}
```

Or in `app.config.js`:

```javascript
export default {
  expo: {
    name: "My App",
    plugins: [
      [
        "@mapples/app",
        {
          message: "Hello from my app!",
          enableLogging: true
        }
      ]
    ]
  }
};
```

### 2. Run Expo Prebuild

After adding the plugin, run:

```bash
npx expo prebuild --clean
```

The plugin will:
- Log a "Hello World" message during the build process
- Add custom configuration to your app's plist files
- Include metadata about the plugin usage

## Plugin Configuration

The plugin accepts the following configuration options:

### `HelloWorldPluginProps`

```typescript
interface HelloWorldPluginProps {
  message?: string;        // Custom message to display (default: "Hello world, from Mapples Expo plugin!")
  enableLogging?: boolean; // Whether to enable console logging (default: true)
}
```

### Configuration Examples

#### Basic Usage

```json
{
  "expo": {
    "plugins": ["@mapples/app"]
  }
}
```

#### With Custom Message

```json
{
  "expo": {
    "plugins": [
      [
        "@mapples/app",
        {
          "message": "Welcome to my awesome app!"
        }
      ]
    ]
  }
}
```

#### Disable Logging

```json
{
  "expo": {
    "plugins": [
      [
        "@mapples/app",
        {
          "enableLogging": false
        }
      ]
    ]
  }
}
```

## What the Plugin Does

When you add this plugin to your Expo app, it will:

1. **Log Information**: Display a welcome message and app details during the build process
2. **Add Metadata**: Insert plugin information into your app's configuration files:
   - iOS: Adds to `Info.plist`
   - Android: Adds to `app.json`/`app.config.js`
3. **Track Usage**: Records when the plugin was used and its version

### Example Output

When you run `npx expo prebuild`, you'll see:

```
🚀 Mapples Hello World Plugin initialized
📝 Message: Hello world, from Mapples Expo plugin!
📱 App name: My App
📦 App version: 1.0.0
```

### Generated Configuration

The plugin adds the following to your app's configuration:

```json
{
  "MapplesHelloWorldPlugin": {
    "message": "Hello world, from Mapples Expo plugin!",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## Advanced Usage

### Programmatic Usage

You can also use the plugin programmatically in your `app.config.js`:

```javascript
import withHelloWorld from '@mapples/app';

export default {
  expo: {
    name: "My App",
    // ... other config
  },
  plugins: [
    [
      withHelloWorld,
      {
        message: "Custom message from config!",
        enableLogging: true
      }
    ]
  ]
};
```

### Integration with Other Plugins

The plugin works well alongside other Expo plugins:

```json
{
  "expo": {
    "plugins": [
      "@mapples/app",
      "expo-camera",
      "expo-location"
    ]
  }
}
```

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

## Integration with Other Mapples Packages

This package integrates seamlessly with other Mapples packages:

- **@mapples/types**: For shared type definitions
- **@mapples/ui**: For pre-built UI components
- **@mapples/state**: For state management
- **@mapples/render**: For dynamic component rendering

## Troubleshooting

### Plugin Not Working

1. Make sure you've added the plugin to your `app.json` or `app.config.js`
2. Run `npx expo prebuild --clean` to regenerate native files
3. Check that the plugin is properly installed: `npm list @mapples/app`

### Build Errors

If you encounter build errors:

1. Clear your build cache: `npx expo prebuild --clean`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check your Expo SDK version compatibility

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see the LICENSE file for details.

## Support

For support and questions, please visit our [GitHub repository](https://github.com/mapplesorg/mapples-kit) or contact us at [mapples.org](https://mapples.org).
