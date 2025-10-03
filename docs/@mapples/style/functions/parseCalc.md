[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / parseCalc

# Function: parseCalc()

> **parseCalc**(`value`, `base`): `number`

Defined in: [utils/system.ts:209](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/system.ts#L209)

Parses a calc expression and evaluates it with the given base value.
Supports simple operations like addition and subtraction with multipliers.

## Parameters

### value

`string`

The calc expression to parse

### base

`number`

The base value to use for calculations

## Returns

`number`

The calculated numeric result

## Example

```tsx
parseCalc('calc(*2 - 10)', 20); // Returns: 30 (20*2 - 10)
parseCalc('calc(*3 + 5)', 10); // Returns: 35 (10*3 + 5)
```
