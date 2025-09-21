[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / DeepPartial

# Type Alias: DeepPartial\<T\>

> **DeepPartial**\<`T`\> = `{ [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }`

Defined in: [packages/@mapples/style/src/types/system.ts:5](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/system.ts#L5)

Utility type that makes all properties of an object type optional recursively.
Useful for creating partial configurations where nested objects are also optional.

## Type Parameters

### T

`T`
