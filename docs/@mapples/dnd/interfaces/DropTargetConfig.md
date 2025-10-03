[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DropTargetConfig

# Interface: DropTargetConfig

Defined in: [types/index.ts:167](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L167)

Interface for configuring drop target behavior and layout.

## Extends

- [`DropTargetLayoutConfig`](DropTargetLayoutConfig.md)

## Properties

### index?

> `optional` **index**: `number`

Defined in: [types/index.ts:156](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L156)

The index position within the parent container

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`index`](DropTargetLayoutConfig.md#index)

***

### zIndex?

> `optional` **zIndex**: `number`

Defined in: [types/index.ts:158](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L158)

The z-index for layering

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`zIndex`](DropTargetLayoutConfig.md#zindex)

***

### flexDirection?

> `optional` **flexDirection**: [`FlexDirection`](../enumerations/FlexDirection.md)

Defined in: [types/index.ts:160](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L160)

The flex direction for child elements

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`flexDirection`](DropTargetLayoutConfig.md#flexdirection)

***

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [types/index.ts:169](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/types/index.ts#L169)

Whether this drop target can accept drops
