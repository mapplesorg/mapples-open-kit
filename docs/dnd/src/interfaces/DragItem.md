[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / DragItem

# Interface: DragItem\<T\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:88](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L88)

Interface representing a draggable item with metadata and data.

## Type Parameters

### T

`T`

The type of data associated with the drag item

## Properties

### type

> **type**: `string`

Defined in: [packages/@mapples/dnd/src/types/index.ts:90](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L90)

The type identifier for the drag item

***

### label

> **label**: `string`

Defined in: [packages/@mapples/dnd/src/types/index.ts:92](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L92)

The display label for the drag item

***

### icon?

> `optional` **icon**: `FC`\<`SvgProps`\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:94](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L94)

Optional icon component for the drag item

***

### data

> **data**: `T`

Defined in: [packages/@mapples/dnd/src/types/index.ts:96](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/dnd/src/types/index.ts#L96)

The data payload associated with the drag item
