[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / isCalc

# Function: isCalc()

> **isCalc**\<`T`\>(`value`): `` value is `calc(${string})` ``

Defined in: [utils/system.ts:185](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/system.ts#L185)

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
