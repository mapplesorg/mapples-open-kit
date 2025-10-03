[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / NavigationThemeProvider

# Variable: NavigationThemeProvider

> `const` **NavigationThemeProvider**: `FC`\<`PropsWithChildren`\<[`NavigationThemeProviderProps`](../interfaces/NavigationThemeProviderProps.md)\>\>

Defined in: [components/NavigationThemeProvider.tsx:53](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/components/NavigationThemeProvider.tsx#L53)

Provider component that integrates the style system with React Navigation theming.
This component automatically applies the current theme colors to React Navigation components
and provides theme-aware navigation styling.

## Param

The component props

## Param

Custom theme colors to override navigation defaults

## Param

Child components to be wrapped with navigation theme

## Example

```tsx
import { NavigationThemeProvider } from '@mapples/style';

const App = () => {
  return (
    <NavigationThemeProvider
      themeColors={{
        primary: 'theme.colors.primary',
        background: 'theme.colors.background',
        card: 'theme.colors.surface'
      }}
    >
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationThemeProvider>
  );
};
```
