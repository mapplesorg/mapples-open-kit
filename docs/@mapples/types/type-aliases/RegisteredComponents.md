[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/types](../README.md) / RegisteredComponents

# Type Alias: RegisteredComponents

> **RegisteredComponents** = `Record`\<`string`, [`RegisteredComponent`](../interfaces/RegisteredComponent.md)\>

Defined in: [components.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/types/src/components.ts#L41)

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
