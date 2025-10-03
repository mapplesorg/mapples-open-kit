[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / isColorValue

# Function: isColorValue()

> **isColorValue**(`value`): `boolean`

Defined in: [utils/system.ts:62](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/system.ts#L62)

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
