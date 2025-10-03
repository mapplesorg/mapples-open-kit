[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / Monitor

# Class: Monitor\<DragData, DropData\>

Defined in: [monitor/Monitor.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L27)

Core monitor class that manages drag and drop operations.
This class tracks drag elements, drop targets, handles hit detection, and emits events.

## Type Parameters

### DragData

`DragData` *extends* `object`

The type of data being dragged

### DropData

`DropData` *extends* `object` = `DragData`

The type of data for drop targets (defaults to DragData)

## Constructors

### Constructor

> **new Monitor**\<`DragData`, `DropData`\>(`config`): `Monitor`\<`DragData`, `DropData`\>

Defined in: [monitor/Monitor.ts:61](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L61)

Creates a new Monitor instance.

#### Parameters

##### config

[`MonitorConfig`](../interfaces/MonitorConfig.md)

Configuration options for the monitor

#### Returns

`Monitor`\<`DragData`, `DropData`\>

## Properties

### events

> **events**: `Subject`\<[`DnDEvent`](../interfaces/DnDEvent.md)\<`DragData`, `DropData`\>\>

Defined in: [monitor/Monitor.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L32)

Observable stream of drag and drop events

## Methods

### getDragTargetId()

> **getDragTargetId**(): `null` \| `number`

Defined in: [monitor/Monitor.ts:72](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L72)

Gets the ID of the currently active drag target.

#### Returns

`null` \| `number`

The drag target ID or null if no drag is active

***

### triggerForceLayoutUpdate()

> **triggerForceLayoutUpdate**(): `void`

Defined in: [monitor/Monitor.ts:88](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L88)

Triggers a force layout update event.
This causes all registered elements to recalculate their layout information.

#### Returns

`void`

***

### getDropTarget()

> **getDropTarget**(): `null` \| [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

Defined in: [monitor/Monitor.ts:98](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L98)

Gets the currently active drop target.

#### Returns

`null` \| [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

The drop target or null if no drop target is active

***

### setDropTarget()

> **setDropTarget**(`target`): `void`

Defined in: [monitor/Monitor.ts:106](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L106)

Sets the currently active drop target.

#### Parameters

##### target

The drop target or null

`null` | [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

#### Returns

`void`

***

### getDragTargetData()

> **getDragTargetData**(`id`): `undefined` \| [`DragElementTarget`](../type-aliases/DragElementTarget.md)\<`DragData`\>

Defined in: [monitor/Monitor.ts:115](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L115)

Gets the drag target data for a specific ID.

#### Parameters

##### id

`number`

The drag target ID

#### Returns

`undefined` \| [`DragElementTarget`](../type-aliases/DragElementTarget.md)\<`DragData`\>

The drag element target data or undefined if not found

***

### setDropTargetIndex()

> **setDropTargetIndex**(`index`): `void`

Defined in: [monitor/Monitor.ts:123](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L123)

Sets the index position within the current drop target.

#### Parameters

##### index

The index position or null

`null` | `number`

#### Returns

`void`

***

### getDropTargetIndex()

> **getDropTargetIndex**(): `null` \| `number`

Defined in: [monitor/Monitor.ts:131](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L131)

Gets the index position within the current drop target.

#### Returns

`null` \| `number`

The index position or null if no drop target is active

***

### registerDragElement()

> **registerDragElement**(`layout`, `item`): `number`

Defined in: [monitor/Monitor.ts:141](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L141)

Registers a new drag element with the monitor.

#### Parameters

##### layout

`LayoutRectangle`

The layout rectangle of the drag element

##### item

[`DragItem`](../interfaces/DragItem.md)\<`DragData`\>

The drag item configuration

#### Returns

`number`

The unique ID assigned to the drag element

***

### unregisterDragElement()

> **unregisterDragElement**(`id`): `void`

Defined in: [monitor/Monitor.ts:151](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L151)

Unregisters a drag element from the monitor.

#### Parameters

##### id

`number`

The ID of the drag element to unregister

#### Returns

`void`

***

### updateDragElement()

> **updateDragElement**(`id`, `layout`, `item`): `void`

Defined in: [monitor/Monitor.ts:161](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L161)

Updates the layout and item data for a registered drag element.

#### Parameters

##### id

`number`

The ID of the drag element

##### layout

`LayoutRectangle`

The new layout rectangle

##### item

[`DragItem`](../interfaces/DragItem.md)\<`DragData`\>

The new drag item configuration

#### Returns

`void`

***

### updateDragElementLayout()

> **updateDragElementLayout**(`id`, `layout`): `void`

Defined in: [monitor/Monitor.ts:179](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L179)

Updates only the layout information for a registered drag element.

#### Parameters

##### id

`number`

The ID of the drag element

##### layout

`LayoutRectangle`

The new layout rectangle

#### Returns

`void`

***

### onDragStart()

> **onDragStart**(`dragCoords`): `void`

Defined in: [monitor/Monitor.ts:192](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L192)

Handles the start of a drag operation.

#### Parameters

##### dragCoords

[`DragCoords`](../type-aliases/DragCoords.md)

The coordinates where the drag started

#### Returns

`void`

***

### onDrag()

> **onDrag**(`dragCoords`): `void`

Defined in: [monitor/Monitor.ts:212](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L212)

Handles drag movement during a drag operation.

#### Parameters

##### dragCoords

[`DragCoords`](../type-aliases/DragCoords.md)

The current coordinates of the drag

#### Returns

`void`

***

### onSelect()

> **onSelect**(`dragCoords`): `void`

Defined in: [monitor/Monitor.ts:243](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L243)

Handles selection/tap events.

#### Parameters

##### dragCoords

[`DragCoords`](../type-aliases/DragCoords.md)

The coordinates where the selection occurred

#### Returns

`void`

***

### onExternalSelect()

> **onExternalSelect**(`dataQuery`): `void`

Defined in: [monitor/Monitor.ts:280](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L280)

Handles external selection by data query.

#### Parameters

##### dataQuery

`Partial`\<`DropData`\>

Partial data to match against drop targets

#### Returns

`void`

***

### onDragEnd()

> **onDragEnd**(): `void`

Defined in: [monitor/Monitor.ts:295](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L295)

Handles the end of a drag operation.

#### Returns

`void`

***

### registerDropElement()

> **registerDropElement**(`layout`, `parent`, `config?`, `data?`): `number`

Defined in: [monitor/Monitor.ts:320](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L320)

Registers a new drop element with the monitor.

#### Parameters

##### layout

`LayoutRectangle`

The layout rectangle of the drop element

##### parent

The ID of the parent drop element, or null for root level

`null` | `number`

##### config?

[`DropTargetConfig`](../interfaces/DropTargetConfig.md)

Optional configuration for the drop target

##### data?

`DropData`

Optional data associated with the drop target

#### Returns

`number`

The unique ID assigned to the drop element

***

### unregisterDropElement()

> **unregisterDropElement**(`id`): `void`

Defined in: [monitor/Monitor.ts:367](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L367)

Unregisters a drop element from the monitor.

#### Parameters

##### id

`number`

The ID of the drop element to unregister

#### Returns

`void`

***

### updateDropElement()

> **updateDropElement**(`id`, `layout`, `config?`, `data?`): `void`

Defined in: [monitor/Monitor.ts:383](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/dnd/src/monitor/Monitor.ts#L383)

Updates the layout and configuration for a registered drop element.

#### Parameters

##### id

`number`

The ID of the drop element

##### layout

`LayoutRectangle`

The new layout rectangle

##### config?

[`DropTargetConfig`](../interfaces/DropTargetConfig.md)

Optional new configuration

##### data?

`DropData`

Optional new data

#### Returns

`void`
