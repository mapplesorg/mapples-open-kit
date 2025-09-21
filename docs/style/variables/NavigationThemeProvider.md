[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / NavigationThemeProvider

# Variable: NavigationThemeProvider

> `const` **NavigationThemeProvider**: `FC`\<`PropsWithChildren`\<`NavigationThemeProviderProps`\>\>

Defined in: [packages/@mapples/style/src/components/NavigationThemeProvider.tsx:53](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/components/NavigationThemeProvider.tsx#L53)

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
