[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / NavigationThemeProvider

# Variable: NavigationThemeProvider

> `const` **NavigationThemeProvider**: `FC`\<`PropsWithChildren`\<`NavigationThemeProviderProps`\>\>

Defined in: [packages/@mapples/style/src/components/NavigationThemeProvider.tsx:53](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/NavigationThemeProvider.tsx#L53)

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
