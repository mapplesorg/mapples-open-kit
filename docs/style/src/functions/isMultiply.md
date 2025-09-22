[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / isMultiply

# Function: isMultiply()

> **isMultiply**\<`T`\>(`value`): `` value is `*${number}` ``

Defined in: [packages/@mapples/style/src/utils/system.ts:166](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/utils/system.ts#L166)

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
