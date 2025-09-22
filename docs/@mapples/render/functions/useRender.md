[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/render](../README.md) / useRender

# Function: useRender()

> **useRender**(): [`RenderContextType`](../interfaces/RenderContextType.md)

Defined in: [hooks/useRender.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/hooks/useRender.ts#L26)

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
