[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / getKeysPaths

# Function: getKeysPaths()

> **getKeysPaths**\<`T`, `K`\>(`object`, `prevKey`): `string`[]

Defined in: [utils/system.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/utils/system.ts#L29)

Recursively extracts all key paths from a nested object.

## Type Parameters

### T

`T` *extends* `object`

### K

`K` *extends* `string` \| `number` \| `symbol`

## Parameters

### object

`T`

The object to extract paths from

### prevKey

`string` = `''`

The previous key path (used for recursion)

## Returns

`string`[]

Array of dot-notation paths to all leaf values

## Example

```tsx
const paths = getKeysPaths({
  colors: { primary: '#007AFF', secondary: { light: '#FFF' } }
});
// Returns: ['colors.primary', 'colors.secondary.light']
```
