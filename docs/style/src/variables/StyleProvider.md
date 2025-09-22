[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / StyleProvider

# Variable: StyleProvider

> `const` **StyleProvider**: `FC`\<`PropsWithChildren`\<`StyleProviderProps`\>\>

Defined in: [packages/@mapples/style/src/components/StyleProvider.tsx:52](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/components/StyleProvider.tsx#L52)

Provider component that wraps the application with style configuration and responsive context.
This component should be placed at the root of your application to provide style context
to all child components.

## Param

The component props

## Param

The style configuration object

## Param

Child components to be wrapped with style context

## Example

```tsx
import { StyleProvider } from '@mapples/style';

const App = () => {
  const styleConfig = {
    themeConfig: {
      variant: 'auto',
      defaultColor: '#000000',
      light: { colors: { primary: '#007AFF' } },
      dark: { colors: { primary: '#0A84FF' } }
    },
    typographyConfig: {
      fontFamily: 'System',
      default: 'body',
      typography: { body: { fontSize: 16 } }
    }
  };

  return (
    <StyleProvider style={styleConfig}>
      <MyApp />
    </StyleProvider>
  );
};
```
