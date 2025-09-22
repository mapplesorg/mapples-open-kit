[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / RenderProvider

# Variable: RenderProvider

> `const` **RenderProvider**: `FC`\<`PropsWithChildren`\<[`RenderContextType`](../interfaces/RenderContextType.md)\>\>

Defined in: [packages/@mapples/render/src/components/RenderProvider.tsx:32](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/render/src/components/RenderProvider.tsx#L32)

Provider component that makes registered components available to the render system.

This component wraps your application and provides the registered components
to all child components through React context. It's essential for the render
system to function properly as it makes components available for dynamic rendering.

## Param

The component props

## Param

Map of registered components

## Param

Child components to render

## Example

```tsx
const registeredComponents = {
  Button: { Component: MyButton },
  Text: { Component: MyText },
  View: { Component: MyView }
};

const App = () => (
  <RenderProvider components={registeredComponents}>
    <Render root={rootComponent} />
  </RenderProvider>
);
```
