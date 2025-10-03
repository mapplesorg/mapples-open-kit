[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / flatten

# Function: flatten()

> **flatten**\<`T`\>(`style?`): [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\> *extends* `U`[] ? `U` : [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>

Defined in: [utils/style.ts:87](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/style.ts#L87)

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
