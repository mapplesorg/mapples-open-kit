[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [ui/src](../README.md) / IconButton

# Variable: IconButton

> `const` **IconButton**: `ForwardRefExoticComponent`\<`Omit`\<[`WithStyledProps`](../../../style/src/type-aliases/WithStyledProps.md)\<`PressableProps`\>, `"styled"`\> & `object` & `object` & `object` & `RefAttributes`\<`View`\>\>

Defined in: [packages/@mapples/ui/src/components/inputs/IconButton/IconButton.tsx:66](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/ui/src/components/inputs/IconButton/IconButton.tsx#L66)

A customizable icon button component with SVG support.

The IconButton component displays an SVG icon that can be pressed.
It supports both remote SVG URIs and fallback mock icons, with
comprehensive styling support for both the button container and the icon.

## Example

```tsx
<IconButton
  uri="https://example.com/icon.svg"
  onPress={() => console.log('Icon pressed')}
  styled={{
    style: {
      width: 48,
      height: 48,
      backgroundColor: 'lightblue',
      borderRadius: 24,
    },
    styleSvg: {
      width: 24,
      height: 24,
      color: 'blue',
    },
  }}
/>
```
