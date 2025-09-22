[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / normalizeTextStyleWeb

# Function: normalizeTextStyleWeb()

> **normalizeTextStyleWeb**(`textStyle?`): `undefined` \| `TextStyle`

Defined in: [packages/@mapples/style/src/utils/system.ts:81](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/utils/system.ts#L81)

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
