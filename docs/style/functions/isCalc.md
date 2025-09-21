[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / isCalc

# Function: isCalc()

> **isCalc**\<`T`\>(`value`): `` value is `calc(${string})` ``

Defined in: [packages/@mapples/style/src/utils/system.ts:185](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L185)

Type guard to check if a value is a calc expression (e.g., 'calc(100% - 20px)').

## Type Parameters

### T

`T` *extends* `string`

## Parameters

### value

The value to check

`` `calc(${string})` `` | `T`

## Returns

`` value is `calc(${string})` ``

True if the value is a calc expression

## Example

```tsx
isCalc('calc(100% - 20px)'); // true
isCalc('*2'); // false
isCalc('100px'); // false
```
