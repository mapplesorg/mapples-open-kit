[**@mapples/ui**](../README.md)

***

[@mapples/ui](../globals.md) / Button

# Variable: Button

> `const` **Button**: `ForwardRefExoticComponent`\<`ButtonProps` & `object` & `RefAttributes`\<`View`\>\>

Defined in: [packages/@mapples/ui/src/components/inputs/Button/Button.tsx:49](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/ui/src/components/inputs/Button/Button.tsx#L49)

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
