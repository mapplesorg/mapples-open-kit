import { createContext, MutableRefObject, useContext } from 'react';

import type { NavigationDocument } from '@mapples/types';

import type { RouteScreens } from './project';

/** What the app runtime shares between its root and the screens. */
export interface MapplesRuntimeContextType {
  navigation: NavigationDocument | null;
  routes: Record<string, RouteScreens>;
  /**
   * The route id of the screen in focus, set by that screen's wrapper. The
   * navigation handler reads it to tell a sign-in from any other navigate
   * (see `entersGuardFromFallback`).
   */
  focusedRouteRef: MutableRefObject<string | null>;
}

export const MapplesRuntimeContext =
  createContext<MapplesRuntimeContextType | null>(null);

/** The app runtime; throws outside `MapplesApp` — a screen wrapper needs it. */
export const useMapplesRuntime = (): MapplesRuntimeContextType => {
  const runtime = useContext(MapplesRuntimeContext);
  if (!runtime) {
    throw new Error(
      '[@mapples/app] a Mapples screen rendered outside <MapplesApp> — the root layout must mount it',
    );
  }
  return runtime;
};
