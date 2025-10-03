[**Mapples Open Kit - Types**](../../README.md)

***

[Mapples Open Kit - Types](../../packages.md) / @mapples/render

# @mapples/render

A powerful React rendering system that enables dynamic component rendering from JSON-like component definitions. This package provides a flexible way to build dynamic UIs by defining component trees as data structures and rendering them with registered React components.

## Features

- 🎨 **Dynamic Component Rendering**: Render React components from JSON-like definitions
- 📦 **Component Registration**: Register and manage reusable components
- 🔗 **Data Binding**: Bind dynamic data to component properties
- 🌳 **Nested Components**: Support for complex component hierarchies
- ⚡ **Performance Optimized**: Memoized components for optimal rendering performance
- 📘 **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @mapples/render
# or
yarn add @mapples/render
```

## Quick Start

### 1. Register Components

First, create a registry of components that can be rendered:

```tsx
import { Button, Text, View } from 'react-native';

const registeredComponents = {
  Button: { Component: Button },
  Text: { Component: Text },
  View: { Component: View },
  // Add more components as needed
};
```

### 2. Wrap with RenderProvider

Wrap your application with the `RenderProvider` to make components available:

```tsx
import { RenderProvider } from '@mapples/render';

const App = () => (
  <RenderProvider components={registeredComponents}>
    <YourAppContent />
  </RenderProvider>
);
```

### 3. Define Component Structure

Create a component definition object:

```tsx
const rootComponent = {
  id: 'root',
  type: 'View',
  props: {
    style: { flex: 1, padding: 20 },
  },
  children: ['header', 'content'],
  childComponents: {
    header: {
      id: 'header',
      type: 'Text',
      props: {
        children: 'Welcome to Mapples Render!',
        style: { fontSize: 24, fontWeight: 'bold' },
      },
      children: [],
      childComponents: {},
    },
    content: {
      id: 'content',
      type: 'View',
      props: { style: { marginTop: 20 } },
      children: ['button'],
      childComponents: {
        button: {
          id: 'button',
          type: 'Button',
          props: {
            title: 'Click Me',
            onPress: () => console.log('Button pressed!'),
          },
          children: [],
          childComponents: {},
        },
      },
    },
  },
};
```

### 4. Render the Component

Use the `Render` component to render your component tree:

```tsx
import { Render } from '@mapples/render';

const YourAppContent = () => <Render root={rootComponent} />;
```

## API Reference

### Components

#### `Render`

The main component for rendering component trees from definitions.

**Props:**

- `root: RenderComponentType` - The root component definition to render
- `CustomRenderComponent?: FC<RenderComponentType>` - Optional custom render component

**Example:**

```tsx
<Render root={componentDefinition} />
```

#### `RenderProvider`

Provider component that makes registered components available to the render system.

**Props:**

- `components: RegisteredComponents` - Map of registered components
- `children: ReactNode` - Child components

**Example:**

```tsx
<RenderProvider components={registeredComponents}>
  <App />
</RenderProvider>
```

#### `RenderComponent`

Default implementation for rendering individual components. This is used internally by the `Render` component.

### Hooks

#### `useRender()`

Hook to access the render context and registered components.

**Returns:**

- `RenderContextType` - The render context containing registered components

**Example:**

```tsx
const { components } = useRender();
const ButtonComponent = components['Button']?.Component;
```

### Types

#### `RenderComponentType`

Core interface representing a renderable component:

```tsx
interface RenderComponentType {
  id: string; // Unique identifier
  type: string; // Component type name
  props: AnyObject & { zIndex?: number }; // Component props
  children: string[]; // Child component IDs
  childComponents: ChildComponents; // Child component definitions
  dataProps?: DataProps; // Data property bindings
  actionProps?: ActionPropsMap; // Action property configurations
}
```

#### `DataProp`

Configuration for data properties:

```tsx
interface DataProp {
  key: string; // Data key identifier
  active: boolean; // Whether the property is active
}
```

#### `ActionProps`

Configuration for action properties:

```tsx
interface ActionProps {
  type?: string; // Action type
  dataProp?: string; // Data property key
}
```

## Advanced Usage

### Data Binding

Bind dynamic data to component properties using `dataProps`:

```tsx
const componentWithData = {
  id: 'dynamic-text',
  type: 'Text',
  props: { children: 'Default Text' },
  dataProps: {
    children: {
      key: 'userName',
      active: true,
    },
  },
  children: [],
  childComponents: {},
};
```

### Custom Render Component

Override the default rendering behavior with a custom component:

```tsx
const CustomRenderer = ({ type, props, children }) => (
  <div className={`custom-${type}`} {...props}>
    {children}
  </div>
);

<Render root={componentDefinition} CustomRenderComponent={CustomRenderer} />;
```

## Performance Considerations

- Components are automatically memoized to prevent unnecessary re-renders
- Use stable component IDs to maintain proper memoization
- Consider component tree depth for optimal performance
- Register only the components you need to reduce bundle size

## Error Handling

The render system gracefully handles missing components by returning `null` instead of throwing errors. Always ensure your component types are properly registered in the `RenderProvider`.

## Integration with Other Mapples Packages

This package integrates seamlessly with other Mapples packages:

- **@mapples/state**: For data binding and state management
- **@mapples/types**: For shared type definitions
- **@mapples/ui**: For pre-built UI components

## Examples

### Simple Form

```tsx
const formComponent = {
  id: 'form',
  type: 'View',
  props: { style: { padding: 20 } },
  children: ['title', 'input', 'button'],
  childComponents: {
    title: {
      id: 'title',
      type: 'Text',
      props: { children: 'Contact Form', style: { fontSize: 20 } },
      children: [],
      childComponents: {},
    },
    input: {
      id: 'input',
      type: 'TextInput',
      props: {
        placeholder: 'Enter your name',
        style: { borderWidth: 1, padding: 10, marginVertical: 10 },
      },
      children: [],
      childComponents: {},
    },
    button: {
      id: 'button',
      type: 'Button',
      props: {
        title: 'Submit',
        onPress: () => console.log('Form submitted'),
      },
      children: [],
      childComponents: {},
    },
  },
};
```

### Nested Layout

```tsx
const layoutComponent = {
  id: 'layout',
  type: 'View',
  props: { style: { flex: 1 } },
  children: ['header', 'content', 'footer'],
  childComponents: {
    header: {
      id: 'header',
      type: 'View',
      props: { style: { height: 60, backgroundColor: '#f0f0f0' } },
      children: ['header-text'],
      childComponents: {
        'header-text': {
          id: 'header-text',
          type: 'Text',
          props: {
            children: 'Header',
            style: { textAlign: 'center', marginTop: 20 },
          },
          children: [],
          childComponents: {},
        },
      },
    },
    content: {
      id: 'content',
      type: 'View',
      props: { style: { flex: 1, padding: 20 } },
      children: [],
      childComponents: {},
    },
    footer: {
      id: 'footer',
      type: 'View',
      props: { style: { height: 60, backgroundColor: '#f0f0f0' } },
      children: ['footer-text'],
      childComponents: {
        'footer-text': {
          id: 'footer-text',
          type: 'Text',
          props: {
            children: 'Footer',
            style: { textAlign: 'center', marginTop: 20 },
          },
          children: [],
          childComponents: {},
        },
      },
    },
  },
};
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see the LICENSE file for details.

## Support

For support and questions, please visit our [GitHub repository](https://github.com/mapplesorg/mapples-kit) or contact us at [mapples.org](https://mapples.org).

## Interfaces

- [ActionProps](interfaces/ActionProps.md)
- [RenderComponentType](interfaces/RenderComponentType.md)
- [RenderDom](interfaces/RenderDom.md)
- [RenderContextType](interfaces/RenderContextType.md)

## Type Aliases

- [AnyObject](type-aliases/AnyObject.md)
- [ChildComponents](type-aliases/ChildComponents.md)
- [ActionPropsMap](type-aliases/ActionPropsMap.md)
- [RefPropsMap](type-aliases/RefPropsMap.md)
- [RenderProps](type-aliases/RenderProps.md)

## Variables

- [RenderComponent](variables/RenderComponent.md)
- [RenderProvider](variables/RenderProvider.md)
- [RenderContext](variables/RenderContext.md)
- [RenderContextProvider](variables/RenderContextProvider.md)

## Functions

- [Render](functions/Render.md)
- [useRender](functions/useRender.md)
