[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / normalizeTextStyleWeb

# Function: normalizeTextStyleWeb()

> **normalizeTextStyleWeb**(`textStyle?`): `undefined` \| `TextStyle`

Defined in: [utils/system.ts:81](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/utils/system.ts#L81)

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
