[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/ui](../README.md) / TextInput

# Variable: TextInput

> `const` **TextInput**: `ForwardRefExoticComponent`\<`TextInputProps` & `object` & `RefAttributes`\<`TextInput`\>\>

Defined in: [packages/@mapples/ui/src/components/inputs/TextInput/TextInput.tsx:32](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/ui/src/components/inputs/TextInput/TextInput.tsx#L32)

A customizable text input component with built-in styling support.

The TextInput component extends React Native's TextInput with additional styling
capabilities through the @mapples/style system. It supports all standard
TextInput properties and behaviors.

## Example

```tsx
<TextInput
  placeholder="Enter your text"
  value={text}
  onChangeText={setText}
  styled={{
    style: {
      borderWidth: 1,
      borderColor: 'gray',
      padding: 12,
      borderRadius: 8
    }
  }}
/>
```
