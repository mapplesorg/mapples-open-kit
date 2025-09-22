[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/ui](../README.md) / View

# Variable: View

> `const` **View**: `ForwardRefExoticComponent`\<`object` & `ViewProps` & `object` & `RefAttributes`\<`unknown`\>\>

Defined in: [packages/@mapples/ui/src/components/views/View/View.tsx:37](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/ui/src/components/views/View/View.tsx#L37)

A customizable view component with built-in styling support.

The View component extends React Native's View with additional styling
capabilities through the @mapples/style system. It serves as a container
for other UI elements and supports all standard view properties.

## Example

```tsx
<View
  styled={{
    style: {
      backgroundColor: 'lightblue',
      padding: 16,
      borderRadius: 8
    }
  }}
>
  <Text>Content inside the view</Text>
</View>
```
