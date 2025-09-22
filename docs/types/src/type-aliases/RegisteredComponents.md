[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [types/src](../README.md) / RegisteredComponents

# Type Alias: RegisteredComponents

> **RegisteredComponents** = `Record`\<`string`, [`RegisteredComponent`](../interfaces/RegisteredComponent.md)\>

Defined in: [packages/@mapples/types/src/components.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/types/src/components.ts#L41)

A record type that maps component type strings to their registered component definitions.
This is the main registry structure for all available components in the system.

## Example

```typescript
const components: RegisteredComponents = {
  'Button': buttonComponent,
  'TextInput': textInputComponent,
  'View': viewComponent
};
```
