**@mapples/style**

***

# @mapples/style

A comprehensive styling system for React Native applications that provides theme management, typography, responsive design, and enhanced styling capabilities.

## Features

- 🎨 **Theme Management**: Light/dark mode support with automatic device preference detection
- 📱 **Responsive Design**: Breakpoint-based responsive styling with automatic detection
- 🔤 **Typography System**: Consistent text styling with customizable variants
- 📏 **Enhanced Sizing**: Support for multipliers, calc expressions, and theme-based sizing
- 🎯 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ⚡ **Performance**: Optimized with memoization and efficient style processing
- 🔧 **Flexible**: Easy to configure and extend with custom themes and breakpoints

## Installation

```bash
npm install @mapples/style
# or
yarn add @mapples/style
```

## Quick Start

### 1. Setup StyleProvider

Wrap your app with the `StyleProvider` to enable the styling system:

```tsx
import React from 'react';
import { StyleProvider, Styler } from '@mapples/style';

const App = () => {
  const styleConfig = Styler.init({
    themeConfig: {
      variant: 'auto', // 'light', 'dark', or 'auto'
      defaultColor: '#000000',
      light: {
        colors: {
          primary: '#007AFF',
          background: '#FFFFFF',
          text: '#000000',
        },
      },
      dark: {
        colors: {
          primary: '#0A84FF',
          background: '#000000',
          text: '#FFFFFF',
        },
      },
    },
    typographyConfig: {
      fontFamily: 'System',
      color: 'theme.colors.text',
      default: 'body',
      typography: {
        heading1: {
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 40,
        },
        body: {
          fontSize: 16,
          lineHeight: 24,
        },
        caption: {
          fontSize: 12,
          lineHeight: 16,
        },
      },
    },
    sizingConfig: {
      base: 4,
      sizing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
    responsiveConfig: {
      default: 'mobile',
      breakpoints: {
        mobile: { min: 0, max: 767 },
        tablet: { min: 768, max: 1023 },
        desktop: { min: 1024, max: Infinity },
      },
    },
  });

  return (
    <StyleProvider style={styleConfig}>
      <YourApp />
    </StyleProvider>
  );
};
```

### 2. Use Styled Components

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Typography, useTheme, useSizing, useResponsive } from '@mapples/style';

const MyComponent = () => {
  const { getColor } = useTheme();
  const { getSize } = useSizing();
  const { getResponsiveStyle } = useResponsive();

  return (
    <View
      style={{
        backgroundColor: getColor('theme.colors.background'),
        padding: getSize('md'),
        ...getResponsiveStyle({
          flexDirection: 'column',
          '&:tablet': { flexDirection: 'row' },
        }),
      }}
    >
      <Typography variant="heading1">Welcome</Typography>
      <Typography variant="body" color="theme.colors.primary">
        This is styled text with theme colors
      </Typography>
    </View>
  );
};
```

## API Reference

### Hooks

#### `useStyle(customStyleConfig?)`

Access the current style configuration from the StyleContext.

```tsx
const style = useStyle();
// Returns: StyleContextType
```

#### `useTheme(customStyleConfig?)`

Access theme utilities with automatic color scheme detection.

```tsx
const { theme, getColor, getColors, colorScheme } = useTheme();

// Get a single color
const primaryColor = getColor('theme.colors.primary');

// Get multiple colors
const [bgColor, textColor] = getColors(
  'theme.colors.background',
  'theme.colors.text',
);
```

#### `useTypography()`

Access typography configuration and utilities.

```tsx
const { getTypographyStyle, typographyConfig } = useTypography();

const headingStyle = getTypographyStyle('heading1');
```

#### `useSizing()`

Access sizing configuration with support for calculations and multipliers.

```tsx
const { getSize, sizing } = useSizing();

// Get size from config
const padding = getSize('md');

// Use multiplier (2 times base size)
const doubleSize = getSize('*2');

// Use calc expression
const calculatedSize = getSize('calc(*2 - 10)');
```

#### `useResponsive()`

Access responsive utilities and breakpoint information.

```tsx
const {
  currentBreakpoint,
  isBreakpoint,
  isSmaller,
  isLarger,
  getResponsiveStyle,
} = useResponsive();

// Check current breakpoint
if (isBreakpoint('mobile')) {
  // Mobile-specific logic
}

// Responsive styles
const responsiveStyle = getResponsiveStyle({
  fontSize: 16,
  '&:tablet': { fontSize: 20 },
  '&:desktop': { fontSize: 24 },
});
```

#### `useStyled(styled)`

Process styled objects with theme and sizing interpolation.

```tsx
const styled = useStyled({
  container: {
    backgroundColor: 'theme.colors.background',
    padding: 'sizing.md',
    '&:mobile': { padding: 'sizing.sm' },
  },
});
```

### Components

#### `StyleProvider`

Provider component that wraps the application with style configuration.

```tsx
<StyleProvider style={styleConfig}>
  <YourApp />
</StyleProvider>
```

#### `Typography`

Typography component with theme and responsive support.

```tsx
<Typography variant="heading1">Title</Typography>
<Typography variant="body" color="theme.colors.primary">
  Body text
</Typography>
<Typography selectable>Selectable text</Typography>
```

#### `StyledFlatList`

FlatList component with styled props support.

```tsx
<StyledFlatList
  data={data}
  renderItem={({ item }) => <Text>{item.title}</Text>}
  styled={{
    contentContainerStyle: {
      backgroundColor: 'theme.colors.background',
      padding: 'sizing.md',
    },
  }}
/>
```

#### `NavigationThemeProvider`

Provider for React Navigation theme integration.

```tsx
<NavigationThemeProvider
  themeColors={{
    primary: 'theme.colors.primary',
    background: 'theme.colors.background',
    card: 'theme.colors.surface',
  }}
>
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
</NavigationThemeProvider>
```

### Utilities

#### `Styler`

Utility object for style creation and management.

```tsx
import { Styler } from '@mapples/style';

// Create styled styles
const styles = Styler.create({
  container: {
    padding: 'sizing.md',
    backgroundColor: 'theme.colors.background',
  },
});

// Initialize style configuration
const config = Styler.init({
  themeConfig: {
    /* custom theme */
  },
});

// Flatten style arrays
const flatStyle = Styler.flatten([style1, style2, style3]);
```

## Advanced Usage

### Custom Theme Configuration

```tsx
const customTheme = Styler.init({
  themeConfig: {
    variant: 'auto',
    defaultColor: '#000000',
    light: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        background: '#FFFFFF',
        surface: '#F2F2F7',
        text: '#000000',
        textSecondary: '#8E8E93',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
    dark: {
      colors: {
        primary: '#0A84FF',
        secondary: '#5E5CE6',
        success: '#30D158',
        warning: '#FF9F0A',
        error: '#FF453A',
        background: '#000000',
        surface: '#1C1C1E',
        text: '#FFFFFF',
        textSecondary: '#8E8E93',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
  },
});
```

### Responsive Design Patterns

```tsx
const MyComponent = () => {
  const { getResponsiveStyle } = useResponsive();

  return (
    <View
      style={getResponsiveStyle({
        flexDirection: 'column',
        padding: 'sizing.md',
        '&:tablet': {
          flexDirection: 'row',
          padding: 'sizing.lg',
        },
        '&:desktop': {
          flexDirection: 'row',
          padding: 'sizing.xl',
          maxWidth: 1200,
        },
      })}
    >
      <View
        style={getResponsiveStyle({
          flex: 1,
          '&:tablet': { flex: 0.5 },
          '&:desktop': { flex: 0.33 },
        })}
      >
        <Typography variant="heading1">Content</Typography>
      </View>
    </View>
  );
};
```

### Custom Sizing with Calculations

```tsx
const MyComponent = () => {
  const { getSize } = useSizing();

  return (
    <View
      style={{
        width: getSize('calc(100% - 32px)'), // Full width minus padding
        height: getSize('*10'), // 10 times base size
        padding: getSize('md'),
        margin: getSize('calc(*2 + 8)'), // 2 times base + 8px
      }}
    >
      <Text>Custom sized content</Text>
    </View>
  );
};
```

### Styled Props Pattern

```tsx
const MyComponent = ({ styled }) => {
  const processedStyle = useStyled(styled);

  return (
    <View style={processedStyle.container}>
      <Text style={processedStyle.text}>Styled content</Text>
    </View>
  );
};

// Usage
<MyComponent
  styled={{
    container: {
      backgroundColor: 'theme.colors.background',
      padding: 'sizing.md',
      '&:mobile': { padding: 'sizing.sm' },
    },
    text: {
      color: 'theme.colors.text',
      fontSize: 'sizing.base',
    },
  }}
/>;
```

## Type Definitions

The package provides comprehensive TypeScript types:

- `ThemeConfig` - Theme configuration interface
- `TypographyConfig` - Typography configuration interface
- `SizingConfig` - Sizing configuration interface
- `ResponsiveConfig` - Responsive configuration interface
- `StyleContextType` - Complete style context type
- `StyledProps<T>` - Enhanced props with styling support
- `Color` - Supported color formats (RGB, RGBA, HEX)

## Best Practices

1. **Use Theme Colors**: Always reference colors through the theme system for consistency
2. **Leverage Responsive Design**: Use breakpoint-based styling for better user experience
3. **Consistent Sizing**: Use the sizing system for consistent spacing and dimensions
4. **Type Safety**: Take advantage of TypeScript for better development experience
5. **Performance**: Use `useStyled` for complex styling to benefit from memoization

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see the LICENSE file for details.
