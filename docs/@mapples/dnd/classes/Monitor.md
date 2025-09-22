[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/dnd](../README.md) / Monitor

# Class: Monitor\<DragData, DropData\>

Defined in: [monitor/Monitor.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L27)

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

Defined in: [monitor/Monitor.ts:58](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L58)

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

Defined in: [monitor/Monitor.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L29)

Observable stream of drag and drop events

## Methods

### getDragTargetId()

> **getDragTargetId**(): `null` \| `number`

Defined in: [monitor/Monitor.ts:69](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L69)

Gets the ID of the currently active drag target.

#### Returns

`null` \| `number`

The drag target ID or null if no drag is active

***

### triggerForceLayoutUpdate()

> **triggerForceLayoutUpdate**(): `void`

Defined in: [monitor/Monitor.ts:85](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L85)

Triggers a force layout update event.
This causes all registered elements to recalculate their layout information.

#### Returns

`void`

***

### getDropTarget()

> **getDropTarget**(): `null` \| [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

Defined in: [monitor/Monitor.ts:95](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L95)

Gets the currently active drop target.

#### Returns

`null` \| [`DropTarget`](../interfaces/DropTarget.md)\<`DropData`\>

The drop target or null if no drop target is active

***

### setDropTarget()

> **setDropTarget**(`target`): `void`

Defined in: [monitor/Monitor.ts:103](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L103)

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

Defined in: [monitor/Monitor.ts:112](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L112)

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

Defined in: [monitor/Monitor.ts:120](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L120)

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

Defined in: [monitor/Monitor.ts:128](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L128)

Gets the index position within the current drop target.

#### Returns

`null` \| `number`

The index position or null if no drop target is active

***

### registerDragElement()

> **registerDragElement**(`layout`, `item`): `number`

Defined in: [monitor/Monitor.ts:138](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L138)

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

Defined in: [monitor/Monitor.ts:148](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L148)

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

Defined in: [monitor/Monitor.ts:158](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L158)

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

Defined in: [monitor/Monitor.ts:176](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L176)

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

Defined in: [monitor/Monitor.ts:189](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L189)

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

Defined in: [monitor/Monitor.ts:209](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L209)

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

Defined in: [monitor/Monitor.ts:240](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L240)

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

Defined in: [monitor/Monitor.ts:277](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L277)

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

Defined in: [monitor/Monitor.ts:292](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L292)

Handles the end of a drag operation.

#### Returns

`void`

***

### registerDropElement()

> **registerDropElement**(`layout`, `parent`, `config?`, `data?`): `number`

Defined in: [monitor/Monitor.ts:317](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L317)

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

Defined in: [monitor/Monitor.ts:364](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L364)

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

Defined in: [monitor/Monitor.ts:380](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/dnd/src/monitor/Monitor.ts#L380)

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
