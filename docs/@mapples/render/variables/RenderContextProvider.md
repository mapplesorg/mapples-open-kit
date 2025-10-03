[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/render](../README.md) / RenderContextProvider

# Variable: RenderContextProvider

> `const` **RenderContextProvider**: `Provider`\<[`RenderContextType`](../interfaces/RenderContextType.md)\> = `RenderContext.Provider`

Defined in: [context/RenderContext.ts:35](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/render/src/context/RenderContext.ts#L35)

Provider component for the RenderContext.
Use this to wrap your application and provide registered components
to the render system.

## Example

```tsx
<RenderContextProvider value={{ components: registeredComponents }}>
  <App />
</RenderContextProvider>
```
