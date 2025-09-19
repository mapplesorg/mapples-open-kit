import { indexOf } from 'lodash';

import { DnDEvent, DnDEventType } from '../types';

/**
 * Creates a filter function for drag and drop events.
 * This utility function returns a predicate that checks if an event matches any of the specified event types.
 * 
 * @param events - The event types to filter for
 * @returns A predicate function that returns true if the event matches any of the specified types
 * @public
 */
export const filterEvents =
  (...events: DnDEventType[]) =>
  <DragTarget extends object, DropTarget extends object = DragTarget>(
    event: DnDEvent<DragTarget, DropTarget>,
  ) => {
    return indexOf(events, event.type) >= 0;
  };
