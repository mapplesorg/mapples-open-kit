[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / isColorValue

# Function: isColorValue()

> **isColorValue**(`value`): `boolean`

Defined in: [packages/@mapples/style/src/utils/system.ts:62](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/utils/system.ts#L62)

Checks if a string value is a valid HEX color.

## Parameters

### value

`string`

The string to check

## Returns

`boolean`

True if the value is a valid HEX color

## Example

```tsx
isColorValue('#FF0000'); // true
isColorValue('#FFF'); // true
isColorValue('red'); // false
```
