[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [types/src](../README.md) / RegisteredComponent

# Interface: RegisteredComponent\<T\>

Defined in: [packages/@mapples/types/src/components.ts:22](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/types/src/components.ts#L22)

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

Defined in: [packages/@mapples/types/src/components.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/types/src/components.ts#L23)

Unique identifier for the component type

***

### Component

> **Component**: `ComponentType`\<`PropsWithChildren`\<`T`\>\>

Defined in: [packages/@mapples/types/src/components.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/types/src/components.ts#L24)

The actual React component
