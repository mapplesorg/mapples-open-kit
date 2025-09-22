[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / getThemeRegexp

# Function: getThemeRegexp()

> **getThemeRegexp**\<`T`\>(`theme`): `RegExp`

Defined in: [packages/@mapples/style/src/utils/system.ts:112](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/utils/system.ts#L112)

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
