[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / isMultiply

# Function: isMultiply()

> **isMultiply**\<`T`\>(`value`): `` value is `*${number}` ``

Defined in: [packages/@mapples/style/src/utils/system.ts:166](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L166)

Type guard to check if a value is a multiplier expression (e.g., '*2', '*3').

## Type Parameters

### T

`T` *extends* `string`

## Parameters

### value

The value to check

`` `*${number}` `` | `T`

## Returns

`` value is `*${number}` ``

True if the value is a multiplier expression

## Example

```tsx
isMultiply('*2'); // true
isMultiply('2*'); // false
isMultiply('calc(2 * 4)'); // false
```
