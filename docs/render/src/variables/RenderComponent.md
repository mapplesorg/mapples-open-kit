[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [render/src](../README.md) / RenderComponent

# Variable: RenderComponent

> `const` **RenderComponent**: `FC`\<[`RenderComponentType`](../interfaces/RenderComponentType.md)\>

Defined in: [packages/@mapples/render/src/components/RenderComponent.tsx:44](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/render/src/components/RenderComponent.tsx#L44)

Default implementation of a renderable component.

This component handles the rendering of individual components within the render tree.
It resolves the component type from registered components, applies data properties,
and recursively renders child components.

The component is memoized for performance optimization to prevent unnecessary
re-renders when props haven't changed.

## Param

The component definition

## Param

The component type name (must be registered)

## Param

Component props

## Param

Optional data property bindings

## Param

Array of child component IDs

## Param

Map of child components

## Returns

The rendered component or null if component type not found

## Example

```tsx
const componentDef = {
  id: 'button1',
  type: 'Button',
  props: { title: 'Click me', onPress: handlePress },
  dataProps: { title: { key: 'buttonText', active: true } },
  children: [],
  childComponents: {}
};

<RenderComponent {...componentDef} />
```

## Throws

If the component type is not registered in the render context
