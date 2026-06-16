import { createContext } from 'react';

import { Subject } from 'rxjs';

import { ActionContextType } from './types';

/**
 * React context for managing action store throughout the application.
 * This context provides access to the RxJS Subject that handles action emissions and subscriptions.
 *
 * @constant ActionContext
 */
const ActionContext = createContext<ActionContextType>({
  actionStore: new Subject(),
});

/**
 * Provider component for the Action context.
 * This is the actual React context provider that should be used to wrap components
 * that need access to the action store.
 *
 * @constant ActionContextProvider
 */
export const ActionContextProvider = ActionContext.Provider;

export default ActionContext;
