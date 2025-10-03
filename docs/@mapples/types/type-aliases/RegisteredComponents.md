[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/types](../README.md) / RegisteredComponents

# Type Alias: RegisteredComponents

> **RegisteredComponents** = `Record`\<`string`, [`RegisteredComponent`](../interfaces/RegisteredComponent.md)\>

Defined in: [components.ts:43](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/components.ts#L43)

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
