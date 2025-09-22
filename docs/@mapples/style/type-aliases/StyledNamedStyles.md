[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / StyledNamedStyles

# Type Alias: StyledNamedStyles\<T\>

> **StyledNamedStyles**\<`T`\> = \{ \[P in keyof T\]: SizableStyleProps\<ViewStyle\> \| SizableStyleProps\<TextStyle\> \| SizableStyleProps\<ImageStyle\> \}

Defined in: [types/style.ts:9](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/types/style.ts#L9)

Named styles object with enhanced sizing support for all style types.
Allows using sizing values (dimensions, multipliers, calc expressions) in style definitions.

## Type Parameters

### T

`T`
