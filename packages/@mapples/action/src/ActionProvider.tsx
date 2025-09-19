import { FC, PropsWithChildren, useEffect, useRef } from 'react';

import { Subject } from 'rxjs';

import { ActionContextProvider } from './context';
import { Action, ActionProviderProps } from './types';

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
