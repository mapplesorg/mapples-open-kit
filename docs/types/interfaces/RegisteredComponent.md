[**@mapples/types**](../README.md)

***

[@mapples/types](../globals.md) / RegisteredComponent

# Interface: RegisteredComponent\<T\>

Defined in: [components.ts:22](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/types/src/components.ts#L22)

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

### Component

> **Component**: `ComponentType`\<`PropsWithChildren`\<`T`\>\>

Defined in: [components.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/types/src/components.ts#L24)

The actual React component

***

### type

> **type**: `string`

Defined in: [components.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/types/src/components.ts#L23)

Unique identifier for the component type
