[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / filterEvents

# Function: filterEvents()

> **filterEvents**(...`events`): \<`DragTarget`, `DropTarget`\>(`event`) => `boolean`

Defined in: [utils/index.ts:14](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/utils/index.ts#L14)

Creates a filter function for drag and drop events.
This utility function returns a predicate that checks if an event matches any of the specified event types.

## Parameters

### events

...[`DnDEventType`](../enumerations/DnDEventType.md)[]

The event types to filter for

## Returns

A predicate function that returns true if the event matches any of the specified types

> \<`DragTarget`, `DropTarget`\>(`event`): `boolean`

### Type Parameters

#### DragTarget

`DragTarget` *extends* `object`

#### DropTarget

`DropTarget` *extends* `object` = `DragTarget`

### Parameters

#### event

[`DnDEvent`](../interfaces/DnDEvent.md)\<`DragTarget`, `DropTarget`\>

### Returns

`boolean`
