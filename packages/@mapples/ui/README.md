# @mapples/ui

A comprehensive React Native UI component library with built-in styling support and visual editor integration.

## Overview

The `@mapples/ui` package provides a complete set of customizable React Native components that integrate seamlessly with the Mapples styling system. Each component is designed to work both in traditional React Native applications and in visual editors for drag-and-drop interface building.

## Features

- 🎨 **Built-in Styling**: All components support the `@mapples/style` system for consistent theming
- 🖱️ **Visual Editor Ready**: Components include schematics for visual editor integration
- 📱 **React Native Compatible**: Built on top of React Native and Expo components
- 🔧 **TypeScript Support**: Full TypeScript definitions and IntelliSense support
- 🎯 **Accessible**: Components follow accessibility best practices
- 🚀 **Performance Optimized**: Uses React.forwardRef for optimal performance

## Installation

```bash
npm install @mapples/ui
# or
yarn add @mapples/ui
```

## Component Categories

### Views

Container components for layout and structure:

- **View**: Basic container component with styling support
- **SafeAreaView**: Container that respects device safe areas
- **ScrollView**: Scrollable container with styling support
- **FlatList**: Optimized list component with styling support
- **ImageBackgroundView**: Container with background image support

### Typography

Text display components:

- **Text**: Customizable text component with styling support
- **Typography**: Advanced typography component with variant support

### Inputs

Interactive input components:

- **Button**: Customizable button with label and styling support
- **TextInput**: Text input with styling support
- **IconButton**: Button with icon support
- **Pressable**: Enhanced pressable component with styling

### Media

Media display components:

- **Image**: Image component with styling support (uses Expo Image)
- **Video**: Video component with styling support
- **Icon**: Icon component with SVG support

## Usage Examples

### Basic Button

```tsx
import { Button } from '@mapples/ui';

function MyComponent() {
  return (
    <Button
      label="Click me"
      onPress={() => console.log('Button pressed')}
      styled={{
        style: {
          backgroundColor: 'blue',
          padding: 16,
          borderRadius: 8,
        },
        styleTypography: {
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
        },
      }}
    />
  );
}
```

### Styled View Container

```tsx
import { View, Text } from '@mapples/ui';

function MyContainer() {
  return (
    <View
      styled={{
        style: {
          backgroundColor: 'lightblue',
          padding: 20,
          borderRadius: 12,
          margin: 16,
        },
      }}
    >
      <Text
        text="Hello, World!"
        styled={{
          style: {
            fontSize: 18,
            color: 'darkblue',
            textAlign: 'center',
          },
        }}
      />
    </View>
  );
}
```

### Image with Styling

```tsx
import { Image } from '@mapples/ui';

function MyImage() {
  return (
    <Image
      source={{ uri: 'https://example.com/image.jpg' }}
      alt="Example image"
      styled={{
        style: {
          width: 200,
          height: 200,
          borderRadius: 8,
        },
        styleImage: {
          resizeMode: 'cover',
        },
      }}
    />
  );
}
```

### Text Input

```tsx
import { TextInput } from '@mapples/ui';

function MyInput() {
  const [text, setText] = useState('');

  return (
    <TextInput
      placeholder="Enter your text"
      value={text}
      onChangeText={setText}
      styled={{
        style: {
          borderWidth: 1,
          borderColor: 'gray',
          padding: 12,
          borderRadius: 8,
          fontSize: 16,
        },
      }}
    />
  );
}
```

## Visual Editor Integration

The UI package includes comprehensive schematics for visual editor integration:

```tsx
import { Components, Groups } from '@mapples/ui';

// Components registry for visual editors
console.log(Components); // All available components
console.log(Groups); // Component groups for organization
```

### Component Groups

Components are organized into logical groups:

- **View Group**: Container and layout components
- **Typography Group**: Text and typography components
- **Input Group**: Interactive input components
- **Media Group**: Image, video, and media components

## Styling System Integration

All components support the `@mapples/style` system through the `styled` prop:

```tsx
<Component
  styled={{
    style: {
      // Container styling
      backgroundColor: 'white',
      padding: 16,
    },
    styleTypography: {
      // Typography-specific styling (for text components)
      fontSize: 18,
      color: 'black',
    },
    styleImage: {
      // Image-specific styling (for image components)
      resizeMode: 'cover',
    },
  }}
/>
```

## Project Shape

The themed components (`Button`, `IconButton` and every `@mapples/components`
widget) read their geometry from the project's sizing document through
`useShape()` and `useElevation()`. Every key is optional; a project that sets
none of them renders with the built-in defaults (`DEFAULT_SHAPE`, `ELEVATION`).

| Sizing key     | Range | Effect                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `radius`       | ≥ 0   | Corner radius of controls, chips and small surfaces (`shape.radius.md`; `xs`/`sm` scale with it). `0` squares off pills too.                                                                                                                                                                                                                                                                            |
| `radiusLarge`  | ≥ 0   | Corner radius of cards, sheets and dialogs (`shape.radius.lg`; `xl` scales with it).                                                                                                                                                                                                                                                                                                                    |
| `control`      | pt    | Height of an `md` control; `sm`/`lg`/`xl` keep their steps from it.                                                                                                                                                                                                                                                                                                                                     |
| `borderWidth`  | 0–4   | Outline weight of every surface and control border: outlined cards, fields, chips, checkbox and radio rings, outlined buttons, bar edges, the dark-theme outline of elevated surfaces. Missing, each component keeps its own width (1, 2 or a hairline). Dividers and separators between items keep theirs. Outlines that thicken for focus or the current item draw `max(own width, borderWidth + 1)`. |
| `shadowOffset` | 0–8   | `0` or missing: the soft `ELEVATION`. Above 0: every elevated surface casts a hard shadow, offset by that many points on both axes with no blur, in the theme's text colour (the neo-brutalist look).                                                                                                                                                                                                   |

```tsx
import { useElevation, useShape } from '@mapples/ui';

const shape = useShape();
const elevation = useElevation(); // useElevation('up') for bottom-pinned bars

<View
  style={{
    borderRadius: shape.radius.lg,
    borderWidth: shape.borderWidth(1), // the project's borderWidth, else 1
    boxShadow: elevation,
  }}
/>;
```

`shape.border.width` is the raw `borderWidth` (`undefined` when unset),
`shape.emphasisWidth(2)` the width of a focus or current-item outline and
`shape.shadowOffset` the raw offset. Outside React, `resolveShape` and
`resolveElevation` compute the same values.

## System Palette

The package includes a system color palette for consistent theming:

```tsx
import { SystemPalette } from '@mapples/ui';

// Available colors
SystemPalette.text; // '#000000'
SystemPalette.background; // '#fafafa'
```

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import { ButtonProps, ViewProps, TextProps } from '@mapples/ui';

// Props are fully typed
const buttonProps: ButtonProps = {
  label: 'My Button',
  onPress: () => {},
  styled: {
    style: { backgroundColor: 'blue' },
  },
};
```

## Icons

The package includes SVG icons for visual editors:

```tsx
import Icon from '@mapples/ui/assets';

// Available icons
<Icon.Button />
<Icon.Text />
<Icon.Image />
<Icon.View />
// ... and many more
```

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Mapples](https://mapples.org)

## Support

For support and questions:

- 📧 Email: support@mapples.org
- 🌐 Website: https://mapples.org
- 📖 Documentation: https://docs.mapples.org
