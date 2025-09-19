import { FC, PropsWithChildren, useEffect, useRef } from 'react';

import { Subject } from 'rxjs';

import { ActionContextProvider } from './context';
import { Action, ActionProviderProps } from './types';

/**
 * ActionProvider component that manages the action store and provides it to child components.
 *
 * This component:
 * - Creates and manages an RxJS Subject for action emissions
 * - Subscribes to actions and calls the provided onAction callback
 * - Provides the action store to child components via React context
 * - Automatically cleans up subscriptions when the component unmounts
 *
 * @component
 * @param props - The component props
 * @param props.children - Child components that will have access to the action store
 * @param props.onAction - Callback function called whenever an action is emitted
 *
 * @example
 * ```tsx
 * function App() {
 *   const handleAction = (action: Action) => {
 *     console.log('Action received:', action);
 *     // Handle analytics, logging, etc.
 *   };
 *
 *   return (
 *     <ActionProvider onAction={handleAction}>
 *       <MyApp />
 *     </ActionProvider>
 *   );
 * }
 * ```
 */
const ActionProvider: FC<PropsWithChildren<ActionProviderProps>> = ({
  children,
  onAction,
}) => {
  const ActionStore = useRef(new Subject<Action>());

  useEffect(() => {
    const subscription = ActionStore.current.subscribe(onAction);
    return () => {
      return subscription.unsubscribe();
    };
  }, [onAction]);

  return (
    <ActionContextProvider value={{ actionStore: ActionStore.current }}>
      {children}
    </ActionContextProvider>
  );
};

export default ActionProvider;
