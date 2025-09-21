[**@mapples/render**](../README.md)

***

[@mapples/render](../globals.md) / useRender

# Function: useRender()

> **useRender**(): [`RenderContextType`](../interfaces/RenderContextType.md)

Defined in: [hooks/useRender.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/render/src/hooks/useRender.ts#L26)

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
