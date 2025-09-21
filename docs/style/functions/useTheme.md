[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / useTheme

# Function: useTheme()

> **useTheme**(`customStyleConfig?`): `object`

Defined in: [packages/@mapples/style/src/hooks/useTheme.ts:57](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/hooks/useTheme.ts#L57)

Hook to access and manage theme configuration with automatic color scheme detection.

## Parameters

### customStyleConfig?

[`StyleContextType`](../interfaces/StyleContextType.md)

Optional custom style configuration to override the context value

## Returns

`object`

Object containing theme utilities and current theme state

### colorScheme

> **colorScheme**: `ColorSchemeName`

### getColor()

> **getColor**: (`color`) => [`Color`](../type-aliases/Color.md)

#### Parameters

##### color

`string`

#### Returns

[`Color`](../type-aliases/Color.md)

### getColors()

> **getColors**: (...`colors`) => [`Color`](../type-aliases/Color.md)[]

#### Parameters

##### colors

...`string`[]

#### Returns

[`Color`](../type-aliases/Color.md)[]

### theme

> **theme**: [`ThemeMap`](../interfaces/ThemeMap.md)

### themeConfig

> **themeConfig**: [`ThemeConfig`](../interfaces/ThemeConfig.md)

## Examples

```tsx
const MyComponent = () => {
  const { theme, getColor, colorScheme } = useTheme();

  return (
    <View style={{
      backgroundColor: getColor('theme.colors.background'),
      color: getColor('theme.colors.text')
    }}>
      <Text>Current scheme: {colorScheme}</Text>
    </View>
  );
};
```

```tsx
const MyComponent = () => {
  const { getColors } = useTheme();
  const [bgColor, textColor, borderColor] = getColors(
    'theme.colors.background',
    'theme.colors.text',
    'theme.colors.border'
  );

  return (
    <View style={{ backgroundColor: bgColor, borderColor }}>
      <Text style={{ color: textColor }}>Multiple colors</Text>
    </View>
  );
};
```
