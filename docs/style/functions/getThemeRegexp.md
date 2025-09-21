[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / getThemeRegexp

# Function: getThemeRegexp()

> **getThemeRegexp**\<`T`\>(`theme`): `RegExp`

Defined in: [packages/@mapples/style/src/utils/system.ts:112](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L112)

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
