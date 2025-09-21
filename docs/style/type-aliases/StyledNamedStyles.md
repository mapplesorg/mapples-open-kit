[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / StyledNamedStyles

# Type Alias: StyledNamedStyles\<T\>

> **StyledNamedStyles**\<`T`\> = \{ \[P in keyof T\]: SizableStyleProps\<ViewStyle\> \| SizableStyleProps\<TextStyle\> \| SizableStyleProps\<ImageStyle\> \}

Defined in: [packages/@mapples/style/src/types/style.ts:9](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/style.ts#L9)

Named styles object with enhanced sizing support for all style types.
Allows using sizing values (dimensions, multipliers, calc expressions) in style definitions.

## Type Parameters

### T

`T`
