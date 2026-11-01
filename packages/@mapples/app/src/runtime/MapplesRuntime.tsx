import { FC, PropsWithChildren, useEffect, useMemo, useRef } from 'react';

import ActionProvider from '@mapples/action';
import {
  createFetchTransport,
  RequestActionHandler,
  RequestProvider,
  RequestTransport,
} from '@mapples/request';
import {
  ActiveRouteProvider,
  ConditionActionHandler,
  StateActionHandler,
  VariablesProvider,
  VariablesStorage,
} from '@mapples/state';
import type { ApiDocument } from '@mapples/types';

import type { MapplesProject } from './project';
import RouterActionHandler from './RouterActionHandler';
import {
  MapplesRuntimeContext,
  MapplesRuntimeContextType,
} from './RuntimeContext';
import ThemeVariableBinding from './ThemeVariableBinding';

export interface MapplesRuntimeProps {
  project: MapplesProject;
  /** Persistence for `persist: true` app variables (AsyncStorage, SecureStore, …). */
  variablesStorage?: VariablesStorage;
  /**
   * Performs API requests. Defaults to a direct `fetch` that applies each
   * request's auth from `project.secrets`; pass your own to route calls
   * through a backend that holds the secrets instead.
   */
  transport?: RequestTransport;
  /**
   * A state path the theme follows (`vars.theme`): `light`, `dark` or `auto`
   * there switches the theme at runtime, on every platform. Declare the
   * variable with `persist` to keep the choice across launches.
   */
  themeVariable?: string;
}

/**
 * The API document with the environment the app runs against made active:
 * `project.environment` (an id or a name) when set — naming one the document
 * lacks is a configuration error — else the document's own active one.
 */
const withEnvironment = (
  api: ApiDocument | undefined,
  environment: string | undefined,
): ApiDocument | null => {
  if (!api) return null;
  if (!environment) return api;
  const match = Object.values(api.environments).find(
    (candidate) =>
      candidate.id === environment || candidate.name === environment,
  );
  if (!match) {
    throw new Error(
      `[@mapples/app] EXPO_PUBLIC_MAPPLES_API_ENVIRONMENT="${environment}" names no environment of the API document (${Object.values(
        api.environments,
      )
        .map((candidate) => candidate.name)
        .join(', ')})`,
    );
  }
  return { ...api, activeEnvironmentId: match.id };
};

/**
 * The behaviour runtime of an exported app — what Creator's Play mounts
 * around a prototype: the action bus, the project variables (`vars.*`) with
 * their `mapples:setState` handler, the API runtime (`api.*`, real requests)
 * with its `mapples:request` handler, the focused route's params for the
 * root handlers, and navigation actions driving expo-router.
 */
const MapplesRuntime: FC<PropsWithChildren<MapplesRuntimeProps>> = ({
  project,
  variablesStorage,
  transport,
  themeVariable,
  children,
}) => {
  const focusedRouteRef = useRef<string | null>(null);
  const runtime = useMemo<MapplesRuntimeContextType>(
    () => ({
      navigation: project.navigation ?? null,
      routes: project.routes ?? {},
      focusedRouteRef,
    }),
    [project.navigation, project.routes],
  );
  const api = useMemo(
    () => withEnvironment(project.api, project.environment),
    [project.api, project.environment],
  );
  // The default transport refuses a request whose secret is unset or empty.
  const requestTransport = useMemo(
    () => transport ?? createFetchTransport(project.secrets),
    [transport, project.secrets],
  );

  const persisted = useMemo(
    () =>
      Object.values(project.variables?.variables ?? {})
        .filter((variable) => variable.persist && variable.scope.kind === 'app')
        .map((variable) => variable.name),
    [project.variables],
  );
  useEffect(() => {
    if (persisted.length === 0 || variablesStorage) return;
    console.warn(
      `[@mapples/app] variables ${persisted.join(', ')} are marked "persist" but MapplesApp got no variablesStorage — they reset on every launch`,
    );
  }, [persisted, variablesStorage]);

  return (
    <MapplesRuntimeContext.Provider value={runtime}>
      <ActionProvider>
        <VariablesProvider
          document={project.variables ?? null}
          storage={variablesStorage}
        >
          <RequestProvider
            document={api}
            mode="fetch"
            transport={requestTransport}
          >
            <ActiveRouteProvider>
              <StateActionHandler />
              <RequestActionHandler />
              <ConditionActionHandler />
              <RouterActionHandler />
              {themeVariable ? (
                <ThemeVariableBinding path={themeVariable} />
              ) : null}
              {children}
            </ActiveRouteProvider>
          </RequestProvider>
        </VariablesProvider>
      </ActionProvider>
    </MapplesRuntimeContext.Provider>
  );
};

export default MapplesRuntime;
