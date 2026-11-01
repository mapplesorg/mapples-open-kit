import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { ApiState, ApiStateContextProvider } from '@mapples/state';
import {
  Action,
  API_NAMESPACE,
  ApiDocument,
  ApiRequest,
  apiRequestStateKey,
  apiRequestSuccessState,
} from '@mapples/types';
import { set } from 'lodash';

import { createFetchTransport, RequestTransport } from './transport';

/** Per-request response state, exposed to bindings under the state key. */
export interface ResponseState {
  loading: boolean;
  data?: unknown;
  error?: string;
  status?: number;
  /** Why the live call failed, when `data` is the sample shown instead. */
  liveError?: string;
}

export type RequestExecutionMode = 'sample' | 'fetch';

/** A saved data state every request previews with, in place of its responses. */
export type RequestStateOverride = 'loading' | 'error';

/** The saved data state one request previews with, whatever the others show. */
export type RequestStateChoice = RequestStateOverride | 'success';

export interface RequestRuntimeContextType {
  document: ApiDocument | null;
  mode: RequestExecutionMode;
  transport: RequestTransport;
  onRequestError?: (error: Error, action: Action) => void;
  /** See {@link RequestProviderProps.autoRun}. */
  autoRun: boolean;
  /** See {@link RequestProviderProps.sampleOnFailure}. */
  sampleOnFailure: boolean;
  /** See {@link RequestProviderProps.stateOverride}. */
  stateOverride: RequestStateOverride | null;
  /** See {@link RequestProviderProps.requestOverrides}. */
  requestOverrides: Record<string, RequestStateChoice> | null;
  setResponse: (stateKey: string, state: ResponseState) => void;
  /**
   * Marks a request as running again. Its previous `data`, `status` and
   * `error` stay published until the answer arrives, so a screen bound to it
   * keeps showing what it had instead of blanking for the round trip.
   */
  startRequest: (stateKey: string) => void;
  /** Forgets the named responses, or every one. */
  clearResponses: (stateKeys?: string[]) => void;
}

const RequestRuntimeContext = createContext<RequestRuntimeContextType | null>(
  null,
);

export const useRequestRuntime = () => useContext(RequestRuntimeContext);

export interface RequestProviderProps {
  document?: ApiDocument | null;
  /** `sample` resolves `responseSample`s; `fetch` performs real requests. */
  mode?: RequestExecutionMode;
  /**
   * Performs the call in `fetch` mode. Defaults to a direct `fetch` resolving
   * auth against {@link secrets}; a host that must not call third parties
   * itself (a browser editor behind CORS) routes through its own backend here.
   */
  transport?: RequestTransport;
  /** Secrets by `secretRef` for the default transport — never stored. */
  secrets?: Record<string, string>;
  /**
   * Receives a `mapples:request` action that could not become a request (an
   * unknown request id, an unbound path token). Without it the error is
   * thrown from the action subscription.
   */
  onRequestError?: (error: Error, action: Action) => void;
  /**
   * Seed every request that has a `responseSample` with it, as a settled
   * response, until a real one arrives — so an editor preview shows bound
   * data before any request has run. Off in a shipped app: a sample is
   * design-time data, not a response.
   */
  previewSamples?: boolean;
  /**
   * In `fetch` mode, run every GET request that needs nothing from a
   * triggering action once when the runtime enters `fetch` mode (see
   * `isAutoRunnable`) — the editor's "Live data" switch.
   */
  autoRun?: boolean;
  /**
   * In `fetch` mode, a failed call keeps showing the request's sample, with the
   * failure in `liveError`, so an editor preview doesn't lose the design to a
   * missing secret. Off in a shipped app, where a failure is a failure.
   */
  sampleOnFailure?: boolean;
  /**
   * Publish this saved state for every request instead of its responses, and
   * ignore `mapples:request` actions meanwhile: an editor preview of a screen's
   * loading or error branch.
   */
  stateOverride?: RequestStateOverride | null;
  /**
   * The saved state single requests show, by request id, over
   * {@link stateOverride} and their responses: a mixed preview. Their
   * `mapples:request` actions are ignored meanwhile.
   */
  requestOverrides?: Record<string, RequestStateChoice> | null;
}

/** The response a request's saved state stands for. */
const overriddenResponse = (
  request: ApiRequest,
  override: RequestStateChoice,
): ResponseState => {
  if (override === 'loading') {
    return { loading: true, data: request.states?.loading };
  }
  if (override === 'success') {
    return {
      loading: false,
      data: apiRequestSuccessState(request),
      status: 200,
    };
  }
  const saved = request.states?.error;
  const body = saved?.body as { message?: unknown } | undefined;
  return {
    loading: false,
    data: null,
    status: saved?.status ?? 500,
    error:
      typeof body?.message === 'string'
        ? body.message
        : `HTTP ${saved?.status ?? 500}`,
  };
};

const STATE_KEY_PREFIX = `${API_NAMESPACE}.`;

/**
 * Holds API response state and publishes it through the `@mapples/state` API
 * context, so bindings like `api.login.data.user.name` and conditions like
 * `api.login.loading::eq::true` resolve anywhere in the tree — a nested
 * `StateProvider` (a frame's data state, a list row) doesn't shadow them.
 * Pair with `RequestActionHandler` (rendered as a child) to execute
 * `mapples:request` actions.
 */
const RequestProvider: FC<PropsWithChildren<RequestProviderProps>> = ({
  children,
  document = null,
  mode = 'sample',
  transport,
  secrets,
  onRequestError,
  previewSamples = false,
  autoRun = false,
  sampleOnFailure = false,
  stateOverride = null,
  requestOverrides = null,
}) => {
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});
  // Responses belong to the mode that produced them: leaving `fetch` must not
  // keep showing live data as if it were the preview, nor the reverse.
  const [responsesMode, setResponsesMode] = useState(mode);
  if (mode !== responsesMode) {
    setResponsesMode(mode);
    setResponses({});
  }

  const setResponse = useCallback(
    (stateKey: string, response: ResponseState) => {
      setResponses((prev) => ({ ...prev, [stateKey]: response }));
    },
    [],
  );
  const startRequest = useCallback((stateKey: string) => {
    setResponses((prev) => {
      const previous = prev[stateKey];
      return {
        ...prev,
        [stateKey]: {
          loading: true,
          data: previous?.data,
          status: previous?.status,
          error: previous?.error,
        },
      };
    });
  }, []);
  const clearResponses = useCallback((stateKeys?: string[]) => {
    setResponses((prev) => {
      if (!stateKeys) return {};
      const next = { ...prev };
      for (const stateKey of stateKeys) delete next[stateKey];
      return next;
    });
  }, []);

  // State keys are dot paths under the namespace (`api.login`) — expand the
  // remainder into the nested object shape bindings resolve against.
  const apiState = useMemo(() => {
    const samples: Record<string, ResponseState> = {};
    if (previewSamples && document) {
      for (const request of Object.values(document.requests)) {
        const success = apiRequestSuccessState(request);
        if (success === undefined) continue;
        samples[apiRequestStateKey(request)] = {
          loading: false,
          data: success,
          status: 200,
        };
      }
    }
    const overrides: Record<string, ResponseState> = {};
    if (document) {
      for (const request of Object.values(document.requests)) {
        const override = requestOverrides?.[request.id] ?? stateOverride;
        if (!override) continue;
        overrides[apiRequestStateKey(request)] = overriddenResponse(
          request,
          override,
        );
      }
    }

    const result: ApiState = {};
    for (const [stateKey, response] of Object.entries({
      ...samples,
      ...responses,
      ...overrides,
    })) {
      if (!stateKey.startsWith(STATE_KEY_PREFIX)) {
        throw new Error(
          `State key "${stateKey}" is outside the "${API_NAMESPACE}" namespace`,
        );
      }
      set(result, stateKey.slice(STATE_KEY_PREFIX.length), response);
    }
    return result;
  }, [document, previewSamples, requestOverrides, responses, stateOverride]);

  const resolvedTransport = useMemo(
    () => transport ?? createFetchTransport(secrets),
    [transport, secrets],
  );

  const contextValue = useMemo(
    () => ({
      document,
      mode,
      transport: resolvedTransport,
      onRequestError,
      autoRun,
      sampleOnFailure,
      stateOverride,
      requestOverrides,
      setResponse,
      startRequest,
      clearResponses,
    }),
    [
      document,
      mode,
      resolvedTransport,
      onRequestError,
      autoRun,
      sampleOnFailure,
      stateOverride,
      requestOverrides,
      setResponse,
      startRequest,
      clearResponses,
    ],
  );

  return (
    <RequestRuntimeContext value={contextValue}>
      <ApiStateContextProvider value={apiState}>
        {children}
      </ApiStateContextProvider>
    </RequestRuntimeContext>
  );
};

export default RequestProvider;
