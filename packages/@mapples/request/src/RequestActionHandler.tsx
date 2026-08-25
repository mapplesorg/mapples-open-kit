import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import { useDataState } from '@mapples/state';

import { RequestCommand, toRequestCommand } from './actionCommands';
import { useRequestRuntime } from './RequestProvider';

/** Artificial latency for sample mode so loading states are visible. */
const SAMPLE_DELAY_MS = 500;

/**
 * Bridges the `@mapples/action` store to request execution: subscribes to
 * emitted actions, resolves `mapples:request` actions into commands, executes
 * them (sample or real fetch), stores responses via the surrounding
 * `RequestProvider`, and re-emits `onSuccess`/`onError` follow-up actions
 * (e.g. `mapples:navigate`) onto the same bus. Renders nothing.
 *
 * Must be rendered inside both `RequestProvider` and `ActionProvider`.
 */
const RequestActionHandler = () => {
  const actionStore = useActionStore();
  const runtime = useRequestRuntime();
  const { getValue } = useDataState();

  useEffect(() => {
    if (!runtime?.document) return;

    const { document, mode, secrets, setResponse } = runtime;

    const emitFollowUp = (followUp?: { type: string; data?: unknown }) => {
      if (!followUp?.type) return;
      actionStore.next({
        time: Date.now(),
        type: followUp.type,
        payload: { data: followUp.data },
      });
    };

    const execute = async (command: RequestCommand) => {
      setResponse(command.stateKey, { loading: true });

      if (mode === 'sample') {
        setTimeout(() => {
          setResponse(command.stateKey, {
            loading: false,
            data: command.responseSample ?? null,
            status: 200,
          });
          emitFollowUp(command.onSuccess);
        }, SAMPLE_DELAY_MS);
        return;
      }

      try {
        const response = await fetch(command.url, {
          method: command.method,
          headers: command.headers,
          body:
            command.body !== undefined
              ? JSON.stringify(command.body)
              : undefined,
        });

        // Only bodies that declare JSON are parsed. A body that claims JSON and
        // fails to parse is a broken server contract, so the parse error is left
        // to reach the handler below instead of quietly becoming `null` data.
        const contentType = response.headers.get('content-type') ?? '';
        const data = contentType.includes('json')
          ? await response.json()
          : null;

        setResponse(command.stateKey, {
          loading: false,
          data,
          status: response.status,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        });

        emitFollowUp(response.ok ? command.onSuccess : command.onError);
      } catch (error) {
        // A network/CORS/parse failure is a failed request. It is reported as
        // one: no sample data is substituted for the real response, and only
        // the configured error follow-up runs — never `onSuccess`, which would
        // advance the flow as if the request had worked.
        setResponse(command.stateKey, {
          loading: false,
          data: null,
          error: error instanceof Error ? error.message : 'Request failed',
        });
        emitFollowUp(command.onError);
      }
    };

    const subscription = actionStore.subscribe((action) => {
      const command = toRequestCommand(action, document, {
        getStateValue: (path) => getValue({ key: path, active: true }),
        secrets,
      });
      if (!command) return;
      void execute(command);
    });

    return () => subscription.unsubscribe();
  }, [actionStore, getValue, runtime]);

  return null;
};

export default RequestActionHandler;
