[**Mapples Open Kit - Types**](../../README.md)

***

[Mapples Open Kit - Types](../../packages.md) / @mapples/dnd

# @mapples/dnd

A powerful and flexible drag and drop library for React Native applications. This package provides a complete drag and drop system with gesture handling, hit detection, and hierarchical drop targets.

## Features

- 🎯 **Precise Hit Detection** - Advanced collision detection with configurable padding
- 🌳 **Hierarchical Drop Targets** - Support for nested drop areas with parent-child relationships
- 📱 **React Native Gesture Handler** - Smooth gesture recognition and handling
- 🎨 **Customizable Drag Elements** - Support for custom drag previews and animations
- 📊 **TypeScript Support** - Full type safety with comprehensive TSDoc documentation
- 🔄 **Real-time Updates** - Live layout updates and position tracking
- 🎛️ **Flexible Configuration** - Configurable drop targets with layout options

## Installation

```bash
npm install @mapples/dnd
# or
yarn add @mapples/dnd
```

## Quick Start

### Basic Setup

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { DnDRootView, useDrag, useDrop } from '@mapples/dnd';

interface MyData {
  id: string;
  title: string;
}

const DraggableItem = ({ data }: { data: MyData }) => {
  const ref = useRef<View>(null);
  const { isDragging } = useDrag(ref, {
    type: 'item',
    label: data.title,
    data: data,
  });

  return (
    <View
      ref={ref}
      style={{
        backgroundColor: isDragging ? '#e3f2fd' : '#f5f5f5',
        padding: 16,
        margin: 8,
        borderRadius: 8,
      }}
    >
      <Text>{data.title}</Text>
    </View>
  );
};

const DropZone = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<View>(null);
  const { isOver, dropTarget } = useDrop<MyData>(ref, {
    canDrop: true,
  });

  return (
    <View
      ref={ref}
      style={{
        backgroundColor: isOver ? '#e8f5e8' : '#ffffff',
        borderWidth: 2,
        borderColor: isOver ? '#4caf50' : '#e0e0e0',
        borderStyle: 'dashed',
        padding: 20,
        minHeight: 100,
      }}
    >
      {children}
    </View>
  );
};

const App = () => {
  const handleDrop = (event, item) => {
    console.log('Dropped:', item.data);
  };

  return (
    <DnDRootView<MyData> onDrop={handleDrop}>
      <View style={{ flex: 1, padding: 20 }}>
        <DropZone>
          <Text>Drop items here</Text>
        </DropZone>

        <View style={{ marginTop: 20 }}>
          <DraggableItem data={{ id: '1', title: 'Item 1' }} />
          <DraggableItem data={{ id: '2', title: 'Item 2' }} />
        </View>
      </View>
    </DnDRootView>
  );
};
```

## API Reference

### Components

#### `DnDRootView<T>`

The root component that provides drag and drop functionality to its children.

**Props:**

- `children` - Child components
- `DragElement?` - Optional custom drag element renderer
- `onDrop?` - Callback fired when a drop operation completes

**Example:**

```tsx
<DnDRootView<MyDataType> onDrop={handleDrop}>
  {/* Your draggable and droppable components */}
</DnDRootView>
```

#### `DropArea`

Component that creates a drop area context for establishing parent-child relationships in the drop target hierarchy.

**Props:**

- `forId` - The ID of the parent drop target this area belongs to
- `children` - Child components

**Example:**

```tsx
<DropArea forId={parentId}>
  <DropZone />
</DropArea>
```

### Hooks

#### `useDrag<DragData, DropData>(ref, item)`

Makes a view draggable within the drag and drop system.

**Parameters:**

- `ref` - Reference to the view element that should be draggable
- `item` - The drag item configuration with data and metadata

**Returns:**

- `id` - The unique ID of the drag element
- `updateLayout` - Function to update the element's layout information
- `isDragging` - Whether this element is currently being dragged

**Example:**

```tsx
const { isDragging, updateLayout } = useDrag(ref, {
  type: 'item',
  label: 'My Item',
  data: { id: '1', name: 'Item 1' },
});
```

#### `useDrop<DragData, DropData>(ref, config?, data?)`

Makes a view a drop target within the drag and drop system.

**Parameters:**

- `ref` - Reference to the view element that should be a drop target
- `config?` - Optional configuration for the drop target behavior
- `data?` - Optional data associated with this drop target

**Returns:**

- `id` - The unique ID of the drop element
- `isOver` - Whether a drag is currently over this drop target
- `dropTarget` - The current drop target information
- `dropTargetIndex` - The index position within the drop target
- `isDragging` - Whether any drag operation is currently active
- `updateLayout` - Function to update the element's layout information

**Example:**

```tsx
const { isOver, dropTarget } = useDrop<MyDataType>(
  ref,
  {
    canDrop: true,
    index: 0,
    zIndex: 1,
  },
  { category: 'items' },
);
```

#### `useDnD<DragData, DropData>()`

Hook to access the drag and drop context.

**Returns:**

- `monitor` - The monitor instance that tracks drag and drop operations
- `isDragging` - Whether a drag operation is currently active
- `sv` - Shared value for drag coordinates
- `svOverLayout` - Shared value for overlay layout information

#### `useDropContext()`

Hook to access the drop context for establishing hierarchy.

**Returns:**

- `parent` - The parent drop target ID

### Types

#### `DragItem<T>`

Interface representing a draggable item with metadata and data.

```tsx
interface DragItem<T> {
  type: string; // The type identifier for the drag item
  label: string; // The display label for the drag item
  icon?: FC<SvgProps>; // Optional icon component for the drag item
  data: T; // The data payload associated with the drag item
}
```

#### `DropTargetConfig`

Interface for configuring drop target behavior and layout.

```tsx
interface DropTargetConfig {
  canDrop?: boolean; // Whether this drop target can accept drops
  index?: number; // The index position within the parent container
  zIndex?: number; // The z-index for layering
  flexDirection?: FlexDirection; // The flex direction for child elements
}
```

#### `DnDEvent<DragData, DropData>`

Interface representing a drag and drop event with associated data.

```tsx
interface DnDEvent<DragData, DropData> {
  type: DnDEventType; // The type of drag and drop event
  target?: number | null; // The ID of the drag target element
  dropTarget?: DropTarget<DropData> | null; // The drop target that the drag is currently over
  dropTargetIndex?: number | null; // The index position within the drop target
  data?: DragData | null; // The data associated with the drag operation
  dragCoords?: DragCoords | null; // The current coordinates of the drag operation
}
```

## Advanced Usage

### Hierarchical Drop Targets

```tsx
const NestedDropExample = () => {
  const parentRef = useRef<View>(null);
  const childRef = useRef<View>(null);

  const { isOver: parentIsOver } = useDrop(parentRef, { canDrop: true });
  const { isOver: childIsOver } = useDrop(childRef, { canDrop: true });

  return (
    <DnDRootView>
      <View
        ref={parentRef}
        style={{ backgroundColor: parentIsOver ? 'lightblue' : 'white' }}
      >
        <Text>Parent Drop Zone</Text>

        <DropArea forId={/* parent ID */}>
          <View
            ref={childRef}
            style={{ backgroundColor: childIsOver ? 'lightgreen' : 'white' }}
          >
            <Text>Child Drop Zone</Text>
          </View>
        </DropArea>
      </View>
    </DnDRootView>
  );
};
```

### Custom Drag Element

```tsx
const CustomDragElement = ({ data }: { data: DragItem<MyData> }) => (
  <View
    style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, borderRadius: 5 }}
  >
    <Text style={{ color: 'white' }}>{data.label}</Text>
  </View>
);

const App = () => (
  <DnDRootView<MyData> DragElement={CustomDragElement}>
    {/* Your components */}
  </DnDRootView>
);
```

### Event Handling

```tsx
const App = () => {
  const handleDrop = (event: DnDEvent<MyData>, item: DragItem<MyData>) => {
    console.log('Drop event:', event);
    console.log('Dropped item:', item);

    // Handle the drop logic
    if (event.dropTarget) {
      // Move item to new position
      moveItem(item.data, event.dropTargetIndex);
    }
  };

  return (
    <DnDRootView<MyData> onDrop={handleDrop}>
      {/* Your components */}
    </DnDRootView>
  );
};
```

## Configuration

### Monitor Configuration

The monitor can be configured with padding and outside tracking:

```tsx
// In DnDRootView, the monitor is created with:
const monitor = new Monitor({
  padding: 5, // Padding around drop targets for hit detection
  trackOutside: false, // Whether to track drag operations outside the root element
});
```

### Drop Target Configuration

```tsx
const config: DropTargetConfig = {
  canDrop: true, // Allow drops
  index: 0, // Position in parent
  zIndex: 1, // Layering
  flexDirection: FlexDirection.Row, // Layout direction
};

const { isOver } = useDrop(ref, config);
```

## Performance Considerations

- Use `updateLayout()` sparingly and only when necessary
- Consider using `useCallback` for event handlers to prevent unnecessary re-renders
- The monitor automatically handles cleanup when components unmount
- Hit detection is optimized with spatial indexing

## TypeScript Support

This package is written in TypeScript and provides full type safety. All APIs are documented with TSDoc comments for excellent IDE support and IntelliSense.

## Contributing

Contributions are welcome! Please ensure that:

1. All new APIs include comprehensive TSDoc documentation
2. TypeScript types are properly defined
3. Tests are added for new functionality
4. The README is updated for any new features

## License

MIT License - see LICENSE file for details.

## Enumerations

- [DnDEventType](enumerations/DnDEventType.md)
- [FlexDirection](enumerations/FlexDirection.md)

## Classes

- [Monitor](classes/Monitor.md)

## Interfaces

- [DnDEvent](interfaces/DnDEvent.md)
- [DnDContextType](interfaces/DnDContextType.md)
- [DragItem](interfaces/DragItem.md)
- [DropAreaProps](interfaces/DropAreaProps.md)
- [DropTargetLayoutConfig](interfaces/DropTargetLayoutConfig.md)
- [DropTargetConfig](interfaces/DropTargetConfig.md)
- [DropItem](interfaces/DropItem.md)
- [MonitorConfig](interfaces/MonitorConfig.md)
- [DropTarget](interfaces/DropTarget.md)

## Type Aliases

- [DragCoords](type-aliases/DragCoords.md)
- [DraggableViewProps](type-aliases/DraggableViewProps.md)
- [DnDRootViewProps](type-aliases/DnDRootViewProps.md)
- [LayoutPosition](type-aliases/LayoutPosition.md)
- [DropTree](type-aliases/DropTree.md)
- [DragElementTarget](type-aliases/DragElementTarget.md)

## Variables

- [DropArea](variables/DropArea.md)

## Functions

- [DnDRootView](functions/DnDRootView.md)
- [useDnD](functions/useDnD.md)
- [useDrag](functions/useDrag.md)
- [useDrop](functions/useDrop.md)
- [useDropContext](functions/useDropContext.md)
- [filterEvents](functions/filterEvents.md)
