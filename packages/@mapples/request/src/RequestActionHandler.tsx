import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';
import { followUpData, StateActionType, useDataState } from '@mapples/state';
import {
  Action,
  ApiDocument,
  apiRequestStateKey,
  apiRequestSuccessState,
} from '@mapples/types';
import { get } from 'lodash';

import {
  FollowUpAction,
  isAutoRunnable,
  RequestCommand,
  toRequestCommand,
  toTransportRequest,
} from './actionCommands';
import { RequestActionType } from './constants';
import { useRequestRuntime } from './RequestProvider';
import { TransportResponse } from './transport';

/** Artificial latency for sample mode so loading states are visible. */
const SAMPLE_DELAY_MS = 500;

/** What running the session's refresh request came to. */
type RefreshOutcome =
  /** The session is renewed; the new values, by the variable path they were written to. */
  | { kind: 'renewed'; values: Record<string, unknown> }
  /** The backend refused the refresh: the session is over. */
  | { kind: 'expired' }
  /** The refresh could not be performed (network, a secret): nothing is known. */
  | { kind: 'unreachable' };

const isSet = (value: unknown): boolean =>
  value !== undefined && value !== null && value !== '';

/**
 * The state keys a `mapples:clearResponses` names: `payload.data.requestIds`
 * (ids or names), or every one when it names none.
 */
const stateKeysToClear = (
  action: Action,
  document: ApiDocument,
): string[] | undefined => {
  const ids = (action.payload?.data as { requestIds?: unknown } | undefined)
    ?.requestIds;
  if (!Array.isArray(ids)) return undefined;
  const requests = Object.values(document.requests);
  return ids.map((id) => {
    const request = requests.find(
      (candidate) => candidate.id === id || candidate.name === id,
    );
    if (!request) {
      throw new Error(`API request "${String(id)}" is not in the document`);
    }
    return apiRequestStateKey(request);
  });
};

/**
 * Bridges the `@mapples/action` store to request execution: subscribes to
 * emitted actions, resolves `mapples:request` actions into commands, executes
 * them (sample, or the runtime's transport), stores responses via the surrounding
 * `RequestProvider`, and re-emits `onSuccess`/`onError` follow-up actions
 * (e.g. `mapples:navigate`) onto the same bus. Renders nothing.
 *
 * When the document declares a `session`, a 401 while a session is held runs
 * the refresh request once (shared by every 401 that arrives meanwhile),
 * writes its response into the session variables and retries the request;
 * a refused refresh empties those variables and forgets every response, so
 * the guards send the user to sign in.
 *
 * Must be rendered inside both `RequestProvider` and `ActionProvider`.
 */
const RequestActionHandler = () => {
  const actionStore = useActionStore();
  const runtime = useRequestRuntime();
  const { getValue } = useDataState();

  // The subscription outlives state changes. `getValue` changes with every
  // variable write and every response, and resubscribing on it opened a
  // gap: React runs every effect cleanup of a commit before any effect
  // body, so an action emitted from an effect in that commit — a chained
  // follow-up, an on-enter request — hit the bus while nothing was
  // subscribed. The latest values are read through a ref instead, updated
  // before any passive effect runs.
  const latest = useRef({ runtime, getValue });
  useLayoutEffect(() => {
    latest.current = { runtime, getValue };
  }, [runtime, getValue]);

  /** The refresh in flight, shared by every 401 that arrives meanwhile. */
  const refreshing = useRef<Promise<RefreshOutcome> | null>(null);

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      const { runtime, getValue } = latest.current;
      if (!runtime?.document) return;

      const {
        document,
        mode,
        transport,
        onRequestError,
        sampleOnFailure,
        stateOverride,
        requestOverrides,
        setResponse,
        startRequest,
        clearResponses,
      } = runtime;

      if (action.type === RequestActionType.ClearResponses) {
        clearResponses(stateKeysToClear(action, document));
        return;
      }
      if (stateOverride) return;

      // `null`, not `getValue`'s display default: an unresolved source
      // must not go out as the literal string "N/A".
      const getStateValue = (path: string): unknown =>
        getValue({ key: path, active: true }, null);

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

      // The response goes along as the follow-up's event: it is emitted in
      // the same tick as `setResponse`, so a `state` source reading
      // `api.<name>` still sees the previous render, while
      // `{ kind: 'event', path }` reads the body that just arrived.
      const emitFollowUp = (followUp?: FollowUpAction, response?: unknown) => {
        if (!followUp?.type) return;
        actionStore.next({
          time: Date.now(),
          type: followUp.type,
          payload: {
            data: followUpData(followUp),
            originalEventData: [response],
          },
        });
      };

      /** Whether a 401 on this request means a held session has expired. */
      const sessionExpired = (command: RequestCommand): boolean => {
        const session = document.session;
        if (!session || command.requestId === session.refreshRequestId) {
          return false;
        }
        return Object.keys(session.writes).some((target) =>
          isSet(getStateValue(target)),
        );
      };

      /**
       * Runs the refresh request once for every 401 that arrives while it is
       * in flight. A renewed session is written to its variables through a
       * `mapples:setState` on the bus, the way a sign-in writes them.
       */
      const refreshSession = (): Promise<RefreshOutcome> => {
        if (refreshing.current) return refreshing.current;
        const session = document.session!;
        refreshing.current = (async (): Promise<RefreshOutcome> => {
          const refresh = toRequestCommand(
            {
              time: Date.now(),
              type: RequestActionType.Execute,
              payload: { data: { requestId: session.refreshRequestId } },
            },
            document,
            { getStateValue },
          )!;
          startRequest(refresh.stateKey);
          let response: TransportResponse;
          try {
            response = await transport(toTransportRequest(refresh));
          } catch (error) {
            // The refresh never reached the backend: the session is not
            // known to be over, and the request that needed it fails as it
            // did. The failure is published under the refresh request.
            setResponse(refresh.stateKey, {
              loading: false,
              data: null,
              error: error instanceof Error ? error.message : 'Request failed',
            });
            return { kind: 'unreachable' };
          }
          setResponse(refresh.stateKey, {
            loading: false,
            data: response.data,
            status: response.status,
            error: response.ok ? undefined : `HTTP ${response.status}`,
          });
          if (!response.ok) return { kind: 'expired' };
          const values: Record<string, unknown> = {};
          for (const [target, path] of Object.entries(session.writes)) {
            values[target] = get(response.data, path);
          }
          actionStore.next({
            time: Date.now(),
            type: StateActionType.SetState,
            payload: {
              originalEventData: [response.data],
              data: {
                operations: Object.entries(session.writes).map(
                  ([target, path]) => ({
                    target,
                    source: { kind: 'event', path },
                  }),
                ),
              },
            },
          });
          return { kind: 'renewed', values };
        })().finally(() => {
          refreshing.current = null;
        });
        return refreshing.current;
      };

      /** Ends the session: its variables are emptied and every response forgotten. */
      const endSession = () => {
        const session = document.session!;
        const clears = session.clears ?? Object.keys(session.writes);
        actionStore.next({
          time: Date.now(),
          type: StateActionType.SetState,
          payload: {
            data: {
              operations: clears.map((target) => ({
                target,
                source: { kind: 'static', value: '' },
              })),
              onDone: { type: RequestActionType.ClearResponses },
            },
          },
        });
      };

      const execute = async (command: RequestCommand, retried = false) => {
        startRequest(command.stateKey);

        if (mode === 'sample') {
          setTimeout(() => {
            setResponse(command.stateKey, {
              loading: false,
              data: command.responseSample ?? null,
              status: 200,
            });
            emitFollowUp(command.onSuccess, command.responseSample ?? null);
          }, SAMPLE_DELAY_MS);
          return;
        }

        try {
          const response = await transport(toTransportRequest(command));

          if (response.status === 401 && !retried && sessionExpired(command)) {
            const outcome = await refreshSession();
            if (outcome.kind === 'renewed') {
              // The retry reads the renewed values straight from the
              // response: the variables they were written to commit a render
              // later, and the headers must carry the new token now.
              const retry = toRequestCommand(action, document, {
                getStateValue: (path) =>
                  path in outcome.values
                    ? outcome.values[path]
                    : getStateValue(path),
              })!;
              await execute(retry, true);
              return;
            }
            setResponse(command.stateKey, {
              loading: false,
              data: response.data,
              status: response.status,
              error: `HTTP ${response.status}`,
            });
            if (outcome.kind === 'expired') endSession();
            emitFollowUp(command.onError, response.data);
            return;
          }

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

          emitFollowUp(
            response.ok ? command.onSuccess : command.onError,
            response.data,
          );
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

      let command: RequestCommand | null;
      try {
        command = toRequestCommand(action, document, {
          getStateValue,
          sample: mode === 'sample',
        });
      } catch (error) {
        // The action named a request that can't be built. The host surfaces
        // it; with no host handler it stays an uncaught error.
        if (!onRequestError) throw error;
        onRequestError(error as Error, action);
        return;
      }
      if (!command || requestOverrides?.[command.requestId]) return;
      void execute(command);
    });

    return () => subscription.unsubscribe();
  }, [actionStore]);

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
