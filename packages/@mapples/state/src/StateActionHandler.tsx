import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import { VARIABLES_NAMESPACE } from '@mapples/types';

import {
  SetStateCommand,
  followUpData,
  setStateFollowUp,
  toSetStateCommands,
} from './actionCommands';
import useDataState from './hooks/useDataState';
import { useVariablesState } from './writable/context';
import { getVariableValue } from './writable/VariablesProvider';

const NS_PREFIX = `${VARIABLES_NAMESPACE}.`;

const asNumber = (value: unknown): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const parsed = Number(value ?? NaN);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Bridges the `@mapples/action` store to the writable variables store:
 * subscribes to emitted actions, resolves `mapples:setState` actions into
 * commands, and applies each against the surrounding `VariablesProvider`.
 * Renders nothing.
 *
 * Mount exactly ONCE, inside both `VariablesProvider` and `ActionProvider`
 * (the same shape as `RequestActionHandler`). The root provider owns every
 * mounted variable, so a single handler reaches app- and page-scoped
 * targets alike.
 */
const StateActionHandler = () => {
  const actionStore = useActionStore();
  const variablesState = useVariablesState();
  const { getStateValue } = useDataState();

  useEffect(() => {
    if (!variablesState) return;

    const { value, setValue, reset } = variablesState;

    const apply = (command: SetStateCommand) => {
      const current = getVariableValue(value, command.target);

      switch (command.op) {
        case 'set':
          setValue(command.target, command.value);
          break;
        case 'increment':
          setValue(
            command.target,
            asNumber(current) + asNumber(command.value ?? 1),
          );
          break;
        case 'decrement':
          setValue(
            command.target,
            asNumber(current) - asNumber(command.value ?? 1),
          );
          break;
        case 'toggle':
          setValue(command.target, !current);
          break;
        case 'append':
          setValue(command.target, [
            ...(Array.isArray(current) ? current : []),
            command.value,
          ]);
          break;
        case 'clear': {
          const relative = command.target.startsWith(NS_PREFIX)
            ? command.target.slice(NS_PREFIX.length)
            : command.target;
          reset([relative.split('.')[0]]);
          break;
        }
      }
    };

    const subscription = actionStore.subscribe((action) => {
      const commands = toSetStateCommands(action, { getStateValue });
      if (!commands) return;
      for (const command of commands) apply(command);
      // The writes are queued state updates; the follow-up goes out after
      // them on the same bus, so a navigate lands on a screen whose guard
      // already sees the new value.
      const followUp = setStateFollowUp(action);
      if (followUp) {
        actionStore.next({
          time: Date.now(),
          type: followUp.type,
          payload: { data: followUpData(followUp) },
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [actionStore, getStateValue, variablesState]);

  return null;
};

export default StateActionHandler;
