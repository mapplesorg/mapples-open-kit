[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / DropTargetConfig

# Interface: DropTargetConfig

Defined in: [packages/@mapples/dnd/src/types/index.ts:165](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L165)

Interface for configuring drop target behavior and layout.

## Extends

- [`DropTargetLayoutConfig`](DropTargetLayoutConfig.md)

## Properties

### index?

> `optional` **index**: `number`

Defined in: [packages/@mapples/dnd/src/types/index.ts:154](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L154)

The index position within the parent container

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`index`](DropTargetLayoutConfig.md#index)

***

### zIndex?

> `optional` **zIndex**: `number`

Defined in: [packages/@mapples/dnd/src/types/index.ts:156](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L156)

The z-index for layering

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`zIndex`](DropTargetLayoutConfig.md#zindex)

***

### flexDirection?

> `optional` **flexDirection**: [`FlexDirection`](../enumerations/FlexDirection.md)

Defined in: [packages/@mapples/dnd/src/types/index.ts:158](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L158)

The flex direction for child elements

#### Inherited from

[`DropTargetLayoutConfig`](DropTargetLayoutConfig.md).[`flexDirection`](DropTargetLayoutConfig.md#flexdirection)

***

### canDrop?

> `optional` **canDrop**: `boolean`

Defined in: [packages/@mapples/dnd/src/types/index.ts:167](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L167)

Whether this drop target can accept drops
