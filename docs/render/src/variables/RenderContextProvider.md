[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / RenderContextProvider

# Variable: RenderContextProvider

> `const` **RenderContextProvider**: `Provider`\<[`RenderContextType`](../interfaces/RenderContextType.md)\> = `RenderContext.Provider`

Defined in: [packages/@mapples/render/src/context/RenderContext.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/render/src/context/RenderContext.ts#L34)

Provider component for the RenderContext.
Use this to wrap your application and provide registered components
to the render system.

## Example

```tsx
<RenderContextProvider value={{ components: registeredComponents }}>
  <App />
</RenderContextProvider>
```
