import { useEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';
import { followUpData, useDataState } from '@mapples/state';
import { apiRequestSuccessState } from '@mapples/types';

import {
  FollowUpAction,
  isAutoRunnable,
  RequestCommand,
  toRequestCommand,
  toTransportRequest,
} from './actionCommands';
import { RequestActionType } from './constants';
import { useRequestRuntime } from './RequestProvider';

/** Artificial latency for sample mode so loading states are visible. */
const SAMPLE_DELAY_MS = 500;

/**
 * Bridges the `@mapples/action` store to request execution: subscribes to
 * emitted actions, resolves `mapples:request` actions into commands, executes
 * them (sample, or the runtime's transport), stores responses via the surrounding
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

    const {
      document,
      mode,
      transport,
      onRequestError,
      sampleOnFailure,
      stateOverride,
      setResponse,
    } = runtime;

    /** The sample a failed call keeps showing, when the host asked for that. */
    const sampleFor = (command: RequestCommand): unknown => {
      if (!sampleOnFailure) return undefined;
      const request = document.requests[command.requestId];
      return request ? apiRequestSuccessState(request) : undefined;
    };
    const failed = (command: RequestCommand, message: string): boolean => {
      const sample = sampleFor(command);
      if (sample === undefined) return false;
      setResponse(command.stateKey, {
        loading: false,
        data: sample,
        status: 200,
        liveError: message,
      });
      return true;
    };

    const emitFollowUp = (followUp?: FollowUpAction) => {
      if (!followUp?.type) return;
      actionStore.next({
        time: Date.now(),
        type: followUp.type,
        payload: { data: followUpData(followUp) },
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
        const response = await transport(toTransportRequest(command));

        if (!response.ok && failed(command, `HTTP ${response.status}`)) {
          emitFollowUp(command.onError);
          return;
        }
        setResponse(command.stateKey, {
          loading: false,
          data: response.data,
          status: response.status,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        });

        emitFollowUp(response.ok ? command.onSuccess : command.onError);
      } catch (error) {
        // A rejected transport (network, CORS, parse, an unconfigured secret)
        // is a failed request. It is reported as one: no sample data is
        // substituted for the real response, and only the configured error
        // follow-up runs — never `onSuccess`, which would advance the flow as
        // if the request had worked. An editor preview asked to keep the
        // sample on screen gets that, with the failure beside it.
        const message =
          error instanceof Error ? error.message : 'Request failed';
        if (!failed(command, message)) {
          setResponse(command.stateKey, {
            loading: false,
            data: null,
            error: message,
          });
        }
        emitFollowUp(command.onError);
      }
    };

    const subscription = actionStore.subscribe((action) => {
      if (stateOverride) return;
      let command: RequestCommand | null;
      try {
        command = toRequestCommand(action, document, {
          // `null`, not `getValue`'s display default: an unresolved source
          // must not go out as the literal string "N/A".
          getStateValue: (path) => getValue({ key: path, active: true }, null),
          sample: mode === 'sample',
        });
      } catch (error) {
        // The action named a request that can't be built. The host surfaces
        // it; with no host handler it stays an uncaught error.
        if (!onRequestError) throw error;
        onRequestError(error as Error, action);
        return;
      }
      if (!command) return;
      void execute(command);
    });

    return () => subscription.unsubscribe();
  }, [actionStore, getValue, runtime]);

  // Entering `fetch` mode runs the auto-runnable GETs once, through the bus
  // so they take the same path as a pressed element. Declared after the
  // subscription so it is in place when these are emitted; the ref keeps a
  // document edit (a new runtime value) from running them again.
  const mode = runtime?.mode;
  const autoRun = !!runtime?.autoRun && !!runtime.document;
  const ranForMode = useRef<string | null>(null);
  useEffect(() => {
    if (!autoRun || mode !== 'fetch') {
      ranForMode.current = null;
      return;
    }
    if (ranForMode.current === mode) return;
    ranForMode.current = mode;
    for (const request of Object.values(runtime!.document!.requests)) {
      if (!isAutoRunnable(request)) continue;
      actionStore.next({
        time: Date.now(),
        type: RequestActionType.Execute,
        payload: { data: { requestId: request.id } },
      });
    }
    // Only a mode change (or the runtime becoming able to run) re-runs them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionStore, autoRun, mode]);

  return null;
};

export default RequestActionHandler;
