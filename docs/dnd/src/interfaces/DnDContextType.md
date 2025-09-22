[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [dnd/src](../README.md) / DnDContextType

# Interface: DnDContextType\<DragData, DropData\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:69](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L69)

Interface representing the drag and drop context type.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Properties

### monitor

> **monitor**: `Monitor`\<`DragData`, `DropData`\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:74](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L74)

The monitor instance that tracks drag and drop operations

***

### isDragging

> **isDragging**: `boolean`

Defined in: [packages/@mapples/dnd/src/types/index.ts:76](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L76)

Whether a drag operation is currently active

***

### sv

> **sv**: `SharedValue`\<[`DragCoords`](../type-aliases/DragCoords.md)\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:78](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L78)

Shared value for drag coordinates

***

### svOverLayout

> **svOverLayout**: `SharedValue`\<`LayoutRectangle`\>

Defined in: [packages/@mapples/dnd/src/types/index.ts:80](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/dnd/src/types/index.ts#L80)

Shared value for overlay layout information
