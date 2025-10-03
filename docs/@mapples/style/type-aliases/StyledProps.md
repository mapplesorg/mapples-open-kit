[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / StyledProps

# Type Alias: StyledProps\<T\>

> **StyledProps**\<`T`\> = `{ [P in keyof T]: T[P] extends StyleProp<infer I> ? StyledProp<I> : T[P] }`

Defined in: [types/style.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/style.ts#L26)

Props type that transforms all style properties to support enhanced styling.
Converts standard style props to styled props with theme and sizing support.

## Type Parameters

### T

`T` *extends* `object`
