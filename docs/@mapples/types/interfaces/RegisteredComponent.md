[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/types](../README.md) / RegisteredComponent

# Interface: RegisteredComponent\<T\>

Defined in: [components.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/components.ts#L24)

Represents a registered component in the Mapples component system.
This interface defines all the metadata and configuration needed to register
a component for use in the visual editor.

 RegisteredComponent

## Example

```typescript
const buttonComponent: RegisteredComponent<ButtonProps> = {
  type: 'Button',
  Component: Button,
};
```

## Type Parameters

### T

`T` *extends* `object` = `object`

The props type for the component (must extend object)

## Properties

### type

> **type**: `string`

Defined in: [components.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/components.ts#L25)

Unique identifier for the component type

***

### Component

> **Component**: `ComponentType`\<`PropsWithChildren`\<`T`\>\>

Defined in: [components.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/components.ts#L26)

The actual React component
