[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/ui](../README.md) / Button

# Variable: Button

> `const` **Button**: `ForwardRefExoticComponent`\<[`ButtonProps`](../interfaces/ButtonProps.md) & `object` & `RefAttributes`\<`View`\>\>

Defined in: [packages/@mapples/ui/src/components/inputs/Button/Button.tsx:49](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/ui/src/components/inputs/Button/Button.tsx#L49)

A customizable button component with built-in styling support.

The Button component extends React Native's Pressable with additional styling
capabilities and typography support. It can display a text label and supports
all standard pressable interactions.

## Example

```tsx
<Button
  label="Click me"
  onPress={() => console.log('Button pressed')}
  styled={{
    style: { backgroundColor: 'blue', padding: 16 },
    styleTypography: { color: 'white', fontSize: 16 }
  }}
/>
```
