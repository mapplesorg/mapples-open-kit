import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';
import { VARIABLES_NAMESPACE } from '@mapples/types';
import { isEqual } from 'lodash';

import {
  SetStateCommand,
  SetStateFollowUp,
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

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

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

  // The subscription outlives state changes. The store and the resolver
  // change with every write, and resubscribing on them opened a gap: React
  // runs every effect cleanup of a commit before any effect body, so an
  // action emitted from an effect in that commit hit the bus while nothing
  // was subscribed. The latest values are read through a ref instead,
  // updated before any passive effect runs.
  const latest = useRef({ variablesState, getStateValue });
  useLayoutEffect(() => {
    latest.current = { variablesState, getStateValue };
  }, [variablesState, getStateValue]);

  /**
   * Follow-ups waiting for the writes before them to commit. A follow-up
   * emitted in the same tick as the writes would be resolved by handlers
   * whose state lookups still see the previous render — a request chained
   * after an increment would send the old value — so they go out from the
   * effect that runs once the new values are rendered.
   */
  const pending = useRef<SetStateFollowUp[]>([]);

  const emit = (followUp: SetStateFollowUp) => {
    actionStore.next({
      time: Date.now(),
      type: followUp.type,
      payload: { data: followUpData(followUp) },
    });
  };

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      const { variablesState, getStateValue } = latest.current;
      if (!variablesState) return;
      const commands = toSetStateCommands(action, { getStateValue });
      if (!commands) return;

      const { value, setValue, reset } = variablesState;
      /** Whether the command queued a store update (a re-render will follow). */
      const apply = (command: SetStateCommand): boolean => {
        const current = getVariableValue(value, command.target);

        switch (command.op) {
          case 'set':
            return setValue(command.target, command.value);
          case 'increment':
            return setValue(
              command.target,
              asNumber(current) + asNumber(command.value ?? 1),
            );
          case 'decrement':
            return setValue(
              command.target,
              asNumber(current) - asNumber(command.value ?? 1),
            );
          case 'toggle':
            return setValue(command.target, !current);
          case 'append':
            return setValue(command.target, [
              ...asArray(current),
              command.value,
            ]);
          case 'remove':
            return setValue(
              command.target,
              asArray(current).filter((item) => !isEqual(item, command.value)),
            );
          case 'toggleItem': {
            const items = asArray(current);
            const without = items.filter(
              (item) => !isEqual(item, command.value),
            );
            return setValue(
              command.target,
              without.length === items.length
                ? [...items, command.value]
                : without,
            );
          }
          case 'clear': {
            const relative = command.target.startsWith(NS_PREFIX)
              ? command.target.slice(NS_PREFIX.length)
              : command.target;
            reset([relative.split('.')[0]]);
            return true;
          }
        }
      };

      let written = false;
      for (const command of commands) written = apply(command) || written;
      const followUp = setStateFollowUp(action);
      if (!followUp) return;
      // Nothing was written (every target was unknown): there is no commit
      // to wait for, the follow-up goes out now.
      if (written) pending.current.push(followUp);
      else emit(followUp);
    });

    return () => subscription.unsubscribe();
    // `emit` only reads the stable store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionStore]);

  // The writes have been rendered: every handler now resolves the new
  // values, and a navigate lands on a screen whose guard already sees them.
  const committed = variablesState?.value;
  useEffect(() => {
    if (pending.current.length === 0) return;
    const followUps = pending.current;
    pending.current = [];
    for (const followUp of followUps) emit(followUp);
    // Runs on every committed value; `emit` only reads the stable store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committed]);

  return null;
};

export default StateActionHandler;
