[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / normalizeTextStyleWeb

# Function: normalizeTextStyleWeb()

> **normalizeTextStyleWeb**(`textStyle?`): `undefined` \| `TextStyle`

Defined in: [packages/@mapples/style/src/utils/system.ts:81](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L81)

Normalizes text styles for web compatibility by converting numeric values to pixel strings.

## Parameters

### textStyle?

`StyleProp`\<`TextStyle`\>

The text style to normalize

## Returns

`undefined` \| `TextStyle`

Normalized text style with web-compatible values

## Example

```tsx
const normalized = normalizeTextStyleWeb({
  lineHeight: 20,
  letterSpacing: 1
});
// Returns: { lineHeight: '20px', letterSpacing: '1px' }
```
