[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / StyledProps

# Type Alias: StyledProps\<T\>

> **StyledProps**\<`T`\> = `{ [P in keyof T]: T[P] extends StyleProp<infer I> ? StyledProp<I> : T[P] }`

Defined in: [packages/@mapples/style/src/types/style.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/style.ts#L26)

Props type that transforms all style properties to support enhanced styling.
Converts standard style props to styled props with theme and sizing support.

## Type Parameters

### T

`T` *extends* `object`
