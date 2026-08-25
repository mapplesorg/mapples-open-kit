import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import StateProvider from '@mapples/state';
import { ApiDocument } from '@mapples/types';
import { cloneDeep, set } from 'lodash';

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
  secrets?: Record<string, string>;
  setResponse: (stateKey: string, state: ResponseState) => void;
}

const RequestRuntimeContext = createContext<RequestRuntimeContextType | null>(
  null,
);

export const useRequestRuntime = () => useContext(RequestRuntimeContext);

export interface RequestProviderProps {
  document?: ApiDocument | null;
  /** Base state the responses are merged over. */
  state?: object;
  /** `sample` resolves `responseSample`s; `fetch` performs real requests. */
  mode?: RequestExecutionMode;
  secrets?: Record<string, string>;
}

/**
 * Holds API response state and republishes it through `@mapples/state`, so
 * bindings like `api.login.data.user.name` and conditions like
 * `api.login.loading::eq::true` resolve with zero changes to the state
 * package. Pair with `RequestActionHandler` (rendered as a child) to execute
 * `mapples:request` actions.
 */
const RequestProvider: FC<PropsWithChildren<RequestProviderProps>> = ({
  children,
  document = null,
  state,
  mode = 'sample',
  secrets,
}) => {
  const [responses, setResponses] = useState<Record<string, ResponseState>>({});

  const setResponse = useCallback(
    (stateKey: string, response: ResponseState) => {
      setResponses((prev) => ({ ...prev, [stateKey]: response }));
    },
    [],
  );

  // State keys are dot paths (`api.login`) — expand them into the nested
  // object shape @mapples/state resolves against.
  const mergedState = useMemo(() => {
    const result = cloneDeep(state ?? {});
    for (const [stateKey, response] of Object.entries(responses)) {
      set(result, stateKey, response);
    }
    return result;
  }, [responses, state]);

  const contextValue = useMemo(
    () => ({ document, mode, secrets, setResponse }),
    [document, mode, secrets, setResponse],
  );

  return (
    <RequestRuntimeContext value={contextValue}>
      <StateProvider state={mergedState}>{children}</StateProvider>
    </RequestRuntimeContext>
  );
};

export default RequestProvider;
