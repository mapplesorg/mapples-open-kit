[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/ui](../README.md) / ScrollView

# Variable: ScrollView

> `const` **ScrollView**: `ForwardRefExoticComponent`\<`object` & `ViewProps` & `object` & `RefAttributes`\<`unknown`\>\>

Defined in: [packages/@mapples/ui/src/components/views/ScrollView/ScrollView.tsx:37](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/ui/src/components/views/ScrollView/ScrollView.tsx#L37)

A customizable scrollable view component with built-in styling support.

The ScrollView component extends React Native's ScrollView with additional styling
capabilities through the @mapples/style system. It provides a scrollable container
with hidden scroll indicators by default.

## Example

```tsx
<ScrollView
  styled={{
    style: {
      backgroundColor: 'white',
      padding: 16,
    },
  }}
>
  <Text>Scrollable content goes here</Text>
  <Text>More content...</Text>
</ScrollView>
```
