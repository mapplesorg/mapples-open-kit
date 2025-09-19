import { useContext } from 'react';

import { DnDContext } from '../context';
import { DnDContextType } from '../types';

const useDnD = <
  DragData extends object,
  DropData extends object = DragData,
>() => {
  return useContext(DnDContext) as DnDContextType<DragData, DropData>;
};

export default useDnD;
