[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / flatten

# Function: flatten()

> **flatten**\<`T`\>(`style?`): [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\> *extends* `U`[] ? `U` : [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>

Defined in: [packages/@mapples/style/src/utils/style.ts:87](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/style.ts#L87)

Flattens a style prop into a single style object.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### style?

`StyleProp`\<[`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>\>

The style prop to flatten

## Returns

[`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\> *extends* `U`[] ? `U` : [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>

Flattened style object

## Example

```tsx
const flattenedStyle = Styler.flatten([
  { padding: 10 },
  { margin: 5 },
  { backgroundColor: 'red' }
]);
```
