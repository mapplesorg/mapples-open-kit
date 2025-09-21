[**@mapples/types**](../README.md)

***

[@mapples/types](../globals.md) / RegisteredComponents

# Type Alias: RegisteredComponents

> **RegisteredComponents** = `Record`\<`string`, [`RegisteredComponent`](../interfaces/RegisteredComponent.md)\>

Defined in: [components.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/types/src/components.ts#L41)

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
