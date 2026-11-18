import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';

import { followUpData, toDelayCommand } from './actionCommands';

/**
 * Bridges the `@mapples/action` store to time: resolves `mapples:delay`
 * actions, waits their duration and re-emits the `then` follow-up with the
 * triggering action's event. Waits still pending when the handler unmounts
 * (the app or a Play session closing) are dropped. Renders nothing.
 *
 * Mount once, inside `ActionProvider`, next to the other handlers.
 */
const DelayActionHandler = () => {
  const actionStore = useActionStore();

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const subscription = actionStore.subscribe((action) => {
      const command = toDelayCommand(action);
      if (!command) return;
      const originalEventData = action.payload?.originalEventData;

      const timer = setTimeout(() => {
        timers.delete(timer);
        actionStore.next({
          time: Date.now(),
          type: command.then.type,
          payload: {
            data: followUpData(command.then),
            ...(originalEventData ? { originalEventData } : {}),
          },
        });
      }, command.duration);
      timers.add(timer);
    });

    return () => {
      subscription.unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, [actionStore]);

  return null;
};

export default DelayActionHandler;
