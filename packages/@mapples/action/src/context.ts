import { createContext } from 'react';

import { Subject } from 'rxjs';

import { ActionContextType } from './types';

const ActionContext = createContext<ActionContextType>({
  actionStore: new Subject(),
});

export const ActionContextProvider = ActionContext.Provider;

export default ActionContext;
