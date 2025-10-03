[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / StyledNamedStyles

# Type Alias: StyledNamedStyles\<T\>

> **StyledNamedStyles**\<`T`\> = \{ \[P in keyof T\]: SizableStyleProps\<ViewStyle\> \| SizableStyleProps\<TextStyle\> \| SizableStyleProps\<ImageStyle\> \}

Defined in: [types/style.ts:9](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/style.ts#L9)

Named styles object with enhanced sizing support for all style types.
Allows using sizing values (dimensions, multipliers, calc expressions) in style definitions.

## Type Parameters

### T

`T`
