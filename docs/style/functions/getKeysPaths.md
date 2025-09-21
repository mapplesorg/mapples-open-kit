[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / getKeysPaths

# Function: getKeysPaths()

> **getKeysPaths**\<`T`, `K`\>(`object`, `prevKey`): `string`[]

Defined in: [packages/@mapples/style/src/utils/system.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L29)

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
