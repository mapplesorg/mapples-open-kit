[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / DragItem

# Interface: DragItem\<T\>

Defined in: [types/index.ts:90](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L90)

Interface representing a draggable item with metadata and data.

## Type Parameters

### T

`T`

The type of data associated with the drag item

## Properties

### type

> **type**: `string`

Defined in: [types/index.ts:92](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L92)

The type identifier for the drag item

***

### label

> **label**: `string`

Defined in: [types/index.ts:94](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L94)

The display label for the drag item

***

### icon?

> `optional` **icon**: `FC`\<`SvgProps`\>

Defined in: [types/index.ts:96](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L96)

Optional icon component for the drag item

***

### data

> **data**: `T`

Defined in: [types/index.ts:98](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/types/index.ts#L98)

The data payload associated with the drag item
