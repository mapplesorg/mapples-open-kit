[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / getThemeRegexp

# Function: getThemeRegexp()

> **getThemeRegexp**\<`T`\>(`theme`): `RegExp`

Defined in: [utils/system.ts:112](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/system.ts#L112)

Creates a regular expression pattern for matching theme and sizing references in strings.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### theme

`T`

The theme object to extract paths from

## Returns

`RegExp`

Regular expression for matching theme/sizing references

## Example

```tsx
const regex = getThemeRegexp({ colors: { primary: '#007AFF' } });
const match = 'theme.colors.primary'.match(regex);
```
