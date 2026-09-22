import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

/** The params a screen was navigated to with, keyed by path token (`id`). */
export type RouteParams = Record<string, unknown>;

/**
 * Context holding the params of the screen an element renders in. Kept apart
 * from the data-state context so a nested `StateProvider` (a frame's data
 * state, a list row) never shadows it — `route.*` bindings resolve the same
 * anywhere in the screen. Defaults to `null`: outside a routed screen the
 * bindings fall through to their `altValue`.
 */
const RouteParamsContext = createContext<RouteParams | null>(null);

export const RouteParamsProvider = RouteParamsContext.Provider;

/** The enclosing screen's params, or `null` outside a routed screen. */
export const useRouteParams = (): RouteParams | null =>
  useContext(RouteParamsContext);

/** The focused screen's params, as the runtime root sees them. */
export interface ActiveRouteState {
  params: RouteParams | null;
  /** Called by a screen when it gains focus; `null` when the last one leaves. */
  setParams: (params: RouteParams | null) => void;
}

/**
 * Context holding the params of the screen currently in focus. Action
 * handlers mount above the navigator (one request runtime for the whole
 * app), so a `route.id` a request param reads cannot come from the screen's
 * own context — it comes from here, which the screen updates on focus.
 */
const ActiveRouteContext = createContext<ActiveRouteState | null>(null);

/** Tracks the focused screen's params for handlers mounted above the navigator. */
export const ActiveRouteProvider: FC<PropsWithChildren> = ({ children }) => {
  const [params, setParams] = useState<RouteParams | null>(null);
  const value = useMemo<ActiveRouteState>(
    () => ({ params, setParams }),
    [params],
  );
  return (
    <ActiveRouteContext.Provider value={value}>
      {children}
    </ActiveRouteContext.Provider>
  );
};

/** The focused screen's params store, or `null` without an {@link ActiveRouteProvider}. */
export const useActiveRoute = (): ActiveRouteState | null =>
  useContext(ActiveRouteContext);

export default RouteParamsContext;
