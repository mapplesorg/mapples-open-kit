[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / isColorValue

# Function: isColorValue()

> **isColorValue**(`value`): `boolean`

Defined in: [utils/system.ts:62](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/utils/system.ts#L62)

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
