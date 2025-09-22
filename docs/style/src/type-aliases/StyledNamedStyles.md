[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / StyledNamedStyles

# Type Alias: StyledNamedStyles\<T\>

> **StyledNamedStyles**\<`T`\> = \{ \[P in keyof T\]: SizableStyleProps\<ViewStyle\> \| SizableStyleProps\<TextStyle\> \| SizableStyleProps\<ImageStyle\> \}

Defined in: [packages/@mapples/style/src/types/style.ts:9](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/style.ts#L9)

Named styles object with enhanced sizing support for all style types.
Allows using sizing values (dimensions, multipliers, calc expressions) in style definitions.

## Type Parameters

### T

`T`
