import { useContext } from 'react';

import { DnDContext } from '../context';
import { DnDContextType } from '../types';

/**
 * Hook to access the drag and drop context.
 * This hook provides access to the monitor, drag state, and shared values.
 * 
 * @template DragData - The type of data being dragged
 * @template DropData - The type of data for drop targets (defaults to DragData)
 * @returns The drag and drop context with monitor and state
 * @public
 */
const useDnD = <
  DragData extends object,
  DropData extends object = DragData,
>() => {
  return useContext(DnDContext) as DnDContextType<DragData, DropData>;
};

export default useDnD;
