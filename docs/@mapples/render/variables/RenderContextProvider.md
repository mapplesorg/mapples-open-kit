[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/render](../README.md) / RenderContextProvider

# Variable: RenderContextProvider

> `const` **RenderContextProvider**: `Provider`\<[`RenderContextType`](../interfaces/RenderContextType.md)\> = `RenderContext.Provider`

Defined in: [context/RenderContext.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/context/RenderContext.ts#L34)

Provider component for the RenderContext.
Use this to wrap your application and provide registered components
to the render system.

## Example

```tsx
<RenderContextProvider value={{ components: registeredComponents }}>
  <App />
</RenderContextProvider>
```
