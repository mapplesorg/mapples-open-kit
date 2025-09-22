[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / Render

# Function: Render()

> **Render**(`props`): `Element`

Defined in: [packages/@mapples/render/src/components/Render.tsx:50](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/render/src/components/Render.tsx#L50)

Main render component that renders a component tree from a root component definition.

This is the primary entry point for the render system. It takes a root component
definition and renders it using either a custom render component or the default
RenderComponent implementation.

## Parameters

### props

[`RenderProps`](../type-aliases/RenderProps.md)

The render props

## Returns

`Element`

## Examples

```tsx
const rootComponent = {
  id: 'root',
  type: 'View',
  props: { style: { flex: 1 } },
  children: ['child1'],
  childComponents: {
    child1: {
      id: 'child1',
      type: 'Text',
      props: { children: 'Hello World' },
      children: [],
      childComponents: {}
    }
  }
};

const App = () => (
  <RenderProvider components={registeredComponents}>
    <Render root={rootComponent} />
  </RenderProvider>
);
```

```tsx
// Using a custom render component
const CustomRenderer = (props) => <div className="custom">{props.children}</div>;

<Render
  root={rootComponent}
  CustomRenderComponent={CustomRenderer}
/>
```
