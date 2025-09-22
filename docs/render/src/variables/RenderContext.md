[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / RenderContext

# Variable: RenderContext

> `const` **RenderContext**: `Context`\<[`RenderContextType`](../interfaces/RenderContextType.md)\>

Defined in: [packages/@mapples/render/src/context/RenderContext.ts:18](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/render/src/context/RenderContext.ts#L18)

React context for the render system.
Provides access to registered components throughout the component tree.

This context is used by the RenderProvider to make registered components
available to all child components in the render tree.

## Example

```tsx
const { components } = useContext(RenderContext);
const Component = components['Button']?.Component;
```
