[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / isColorValue

# Function: isColorValue()

> **isColorValue**(`value`): `boolean`

Defined in: [packages/@mapples/style/src/utils/system.ts:62](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L62)

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
