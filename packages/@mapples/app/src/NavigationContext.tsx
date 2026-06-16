import { createContext, FC, PropsWithChildren, useContext } from 'react';

/**
 * Maps Mapples navigation actions to expo-router hrefs.
 *
 * Produced by `mapples navigation sync` (CLI) and default-exported from a
 * generated `navigationMap.ts` placed outside the `app/` route group. The
 * consumer passes it into {@link MapplesApp} via the `navigation` prop,
 * mirroring how `assets` and `style` flow through the app today.
 *
 * @interface NavigationMap
 */
export interface NavigationMap {
  /**
   * Mapples action `routeName` → expo-router href. Both the qualified
   * `navigator:route` name and (when unambiguous) the bare `route` name are
   * emitted as keys during the naming transition.
   */
  routes: Record<string, string>;
}

/** Empty map used when no navigation configuration is provided. */
const EMPTY_NAVIGATION_MAP: NavigationMap = { routes: {} };

/**
 * Context carrying the active {@link NavigationMap}. Defaults to an empty map
 * so {@link useNavigationActions} no-ops gracefully when navigation isn't wired.
 */
export const NavigationContext =
  createContext<NavigationMap>(EMPTY_NAVIGATION_MAP);

/**
 * Provides a {@link NavigationMap} to the tree. Wired by `MapplesApp` /
 * `MapplesAppProvider` alongside `StyleProvider` and `RenderProvider`.
 *
 * @param props.navigation - The navigation map to provide. Falls back to an
 *   empty map when omitted.
 */
export const NavigationProvider: FC<
  PropsWithChildren<{ navigation?: NavigationMap }>
> = ({ navigation, children }) => (
  <NavigationContext.Provider value={navigation ?? EMPTY_NAVIGATION_MAP}>
    {children}
  </NavigationContext.Provider>
);

/** Reads the active {@link NavigationMap} from context. */
export const useNavigationMap = (): NavigationMap =>
  useContext(NavigationContext);
