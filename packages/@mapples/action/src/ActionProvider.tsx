import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { Action } from '@mapples/types';
import { Subject } from 'rxjs';

import { ActionContextProvider } from './context';
import { ActionProviderProps } from './types';

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
  // Lazy state init creates the Subject exactly once and keeps the same
  // instance for the provider's lifetime, without reading a ref during render.
  const [actionStore] = useState(() => new Subject<Action>());

  useEffect(() => {
    const subscription = actionStore.subscribe(onAction);
    return () => {
      return subscription.unsubscribe();
    };
  }, [actionStore, onAction]);

  // Every useActionStore consumer re-renders when this value changes
  // identity — the store instance is stable, so the value can be too.
  const value = useMemo(() => ({ actionStore }), [actionStore]);

  return (
    <ActionContextProvider value={value}>{children}</ActionContextProvider>
  );
};

export default ActionProvider;
