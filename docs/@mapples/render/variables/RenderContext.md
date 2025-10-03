[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/render](../README.md) / RenderContext

# Variable: RenderContext

> `const` **RenderContext**: `Context`\<[`RenderContextType`](../interfaces/RenderContextType.md)\>

Defined in: [context/RenderContext.ts:18](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/render/src/context/RenderContext.ts#L18)

React context for the render system.
Provides access to registered components throughout the component tree.

This context is used by the RenderProvider to make registered components
available to all child components in the render tree.

## Example

```tsx
const { components } = useContext(RenderContext);
const Component = components['Button']?.Component;
```
