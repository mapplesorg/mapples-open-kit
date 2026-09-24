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
  apiRequestStateKey,
} from '@mapples/types';
import { set } from 'lodash';

import { createFetchTransport, RequestTransport } from './transport';

/** Per-request response state, exposed to bindings under the state key. */
export interface ResponseState {
  loading: boolean;
  data?: unknown;
  error?: string;
  status?: number;
}

export type RequestExecutionMode = 'sample' | 'fetch';

export interface RequestRuntimeContextType {
  document: ApiDocument | null;
  mode: RequestExecutionMode;
  transport: RequestTransport;
  onRequestError?: (error: Error, action: Action) => void;
  /** See {@link RequestProviderProps.autoRun}. */
  autoRun: boolean;
  setResponse: (stateKey: string, state: ResponseState) => void;
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
}

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

  // State keys are dot paths under the namespace (`api.login`) — expand the
  // remainder into the nested object shape bindings resolve against.
  const apiState = useMemo(() => {
    const samples: Record<string, ResponseState> = {};
    if (previewSamples && document) {
      for (const request of Object.values(document.requests)) {
        if (request.responseSample === undefined) continue;
        samples[apiRequestStateKey(request)] = {
          loading: false,
          data: request.responseSample,
          status: 200,
        };
      }
    }

    const result: ApiState = {};
    for (const [stateKey, response] of Object.entries({
      ...samples,
      ...responses,
    })) {
      if (!stateKey.startsWith(STATE_KEY_PREFIX)) {
        throw new Error(
          `State key "${stateKey}" is outside the "${API_NAMESPACE}" namespace`,
        );
      }
      set(result, stateKey.slice(STATE_KEY_PREFIX.length), response);
    }
    return result;
  }, [document, previewSamples, responses]);

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
      setResponse,
    }),
    [document, mode, resolvedTransport, onRequestError, autoRun, setResponse],
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
