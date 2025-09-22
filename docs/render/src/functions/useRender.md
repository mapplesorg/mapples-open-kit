[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / useRender

# Function: useRender()

> **useRender**(): [`RenderContextType`](../interfaces/RenderContextType.md)

Defined in: [packages/@mapples/render/src/hooks/useRender.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/render/src/hooks/useRender.ts#L26)

Hook to access the render context.

This hook provides access to the registered components and other render
context data. It should be used within components that are wrapped by
a RenderProvider.

## Returns

[`RenderContextType`](../interfaces/RenderContextType.md)

The render context containing registered components

## Example

```tsx
const MyComponent = () => {
  const { components } = useRender();
  const ButtonComponent = components['Button']?.Component;

  return ButtonComponent ? <ButtonComponent /> : null;
};
```

## Throws

If used outside of a RenderProvider context
