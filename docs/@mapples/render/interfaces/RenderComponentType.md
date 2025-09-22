[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/render](../README.md) / RenderComponentType

# Interface: RenderComponentType

Defined in: [types/index.ts:50](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L50)

Represents a renderable component with all its configuration and children.
This is the core type used throughout the render system.

 RenderComponentType

## Properties

### id

> **id**: `string`

Defined in: [types/index.ts:51](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L51)

Unique identifier for this component instance

***

### type

> **type**: `string`

Defined in: [types/index.ts:52](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L52)

The component type name (must be registered in components)

***

### props

> **props**: [`AnyObject`](../type-aliases/AnyObject.md) & `object`

Defined in: [types/index.ts:53](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L53)

Component props including optional zIndex

#### Type Declaration

##### zIndex?

> `optional` **zIndex**: `number`

***

### \_canvasProps?

> `optional` **\_canvasProps**: [`AnyObject`](../type-aliases/AnyObject.md)

Defined in: [types/index.ts:54](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L54)

Optional drag-and-drop configuration for canvas interactions

***

### children

> **children**: `string`[]

Defined in: [types/index.ts:55](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L55)

Array of child component IDs

***

### childComponents

> **childComponents**: [`ChildComponents`](../type-aliases/ChildComponents.md)

Defined in: [types/index.ts:56](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L56)

Map of child components by their IDs

***

### dataProps?

> `optional` **dataProps**: `Partial`\<`Record`\<`string`, [`DataProp`](../../types/interfaces/DataProp.md)\>\>

Defined in: [types/index.ts:57](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L57)

Optional data property bindings

***

### actionProps?

> `optional` **actionProps**: `Partial`\<`Record`\<`string`, [`ActionProps`](ActionProps.md)\>\>

Defined in: [types/index.ts:58](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/render/src/types/index.ts#L58)

Optional action property configurations
