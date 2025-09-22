[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/ui](../README.md) / IconButton

# Variable: IconButton

> `const` **IconButton**: `ForwardRefExoticComponent`\<`Omit`\<[`WithStyledProps`](../../style/type-aliases/WithStyledProps.md)\<`PressableProps`\>, `"styled"`\> & `object` & `object` & `object` & `RefAttributes`\<`View`\>\>

Defined in: [packages/@mapples/ui/src/components/inputs/IconButton/IconButton.tsx:66](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/ui/src/components/inputs/IconButton/IconButton.tsx#L66)

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
