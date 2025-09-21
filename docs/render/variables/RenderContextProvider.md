[**@mapples/render**](../README.md)

***

[@mapples/render](../globals.md) / RenderContextProvider

# Variable: RenderContextProvider

> `const` **RenderContextProvider**: `Provider`\<[`RenderContextType`](../interfaces/RenderContextType.md)\> = `RenderContext.Provider`

Defined in: [context/RenderContext.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/render/src/context/RenderContext.ts#L34)

Provider component for the RenderContext.
Use this to wrap your application and provide registered components
to the render system.

## Example

```tsx
<RenderContextProvider value={{ components: registeredComponents }}>
  <App />
</RenderContextProvider>
```
