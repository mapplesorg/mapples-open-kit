[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / StyledProps

# Type Alias: StyledProps\<T\>

> **StyledProps**\<`T`\> = `{ [P in keyof T]: T[P] extends StyleProp<infer I> ? StyledProp<I> : T[P] }`

Defined in: [packages/@mapples/style/src/types/style.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/style.ts#L26)

Props type that transforms all style properties to support enhanced styling.
Converts standard style props to styled props with theme and sizing support.

## Type Parameters

### T

`T` *extends* `object`
