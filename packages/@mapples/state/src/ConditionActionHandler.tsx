import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';

import { followUpData, toConditionCommand } from './actionCommands';
import useDataState from './hooks/useDataState';

/**
 * Bridges the `@mapples/action` store to a choice: resolves `mapples:if`
 * actions, evaluates their condition against the state and re-emits the
 * `then` or `else` follow-up with the triggering action's event. Renders
 * nothing.
 *
 * Mount once, inside `ActionProvider` and the state providers the condition
 * reads (`VariablesProvider`, `RequestProvider`), next to the other handlers.
 */
const ConditionActionHandler = () => {
  const actionStore = useActionStore();
  const { getConditionResult } = useDataState();

  // The subscription outlives state changes; the latest evaluator is read
  // through a ref so an action emitted from an effect in the same commit as
  // a write is never lost between an unsubscribe and a resubscribe.
  const latest = useRef(getConditionResult);
  useLayoutEffect(() => {
    latest.current = getConditionResult;
  }, [getConditionResult]);

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      const command = toConditionCommand(action);
      if (!command) return;
      const branch = latest.current(command.condition)
        ? command.then
        : command.else;
      if (!branch) return;
      const originalEventData = action.payload?.originalEventData;
      actionStore.next({
        time: Date.now(),
        type: branch.type,
        payload: {
          data: followUpData(branch),
          ...(originalEventData ? { originalEventData } : {}),
        },
      });
    });
    return () => subscription.unsubscribe();
  }, [actionStore]);

  return null;
};

export default ConditionActionHandler;
