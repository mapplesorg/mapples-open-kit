import { indexOf } from 'lodash';

import { DnDEvent, DnDEventType } from '../types';

export const filterEvents =
  (...events: DnDEventType[]) =>
  <DragTarget extends object, DropTarget extends object = DragTarget>(
    event: DnDEvent<DragTarget, DropTarget>,
  ) => {
    return indexOf(events, event.type) >= 0;
  };
