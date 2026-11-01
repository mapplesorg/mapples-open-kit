import { Context, createContext, EffectCallback, useContext } from 'react';

import type {
  CommonActions,
  createBottomTabNavigator,
  createDrawerNavigator,
  createNativeStackNavigator,
  createNavigationContainerRef,
  DrawerActions,
  NavigationContainer,
  NavigationIndependentTree,
} from './reactNavigation';
import { expoRouterNavigationHooks } from './vendor';

/**
 * The React Navigation hooks a screen and a designed tab bar read. They must
 * come from the same React Navigation copy as the navigator around them:
 * expo-router's vendored copy inside an exported expo-router app (the
 * default), the backend's inside a {@link MapplesNavigation} tree.
 */
export interface NavigationHooks {
  useFocusEffect: (effect: EffectCallback) => void;
  useIsFocused: () => boolean;
  useRoute: () => { params?: object };
  /** The context a custom `tabBar` reports its height through. */
  BottomTabBarHeightCallbackContext: Context<
    ((height: number) => void) | undefined
  >;
}

/**
 * React Navigation itself (`@react-navigation/*`) for {@link MapplesNavigation}
 * to build its own tree with: container, navigators, actions and hooks of one
 * copy. From Expo SDK 58 expo-router no longer vendors a container that can
 * stand apart from its root (`NavigationContainer` / `NavigationIndependentTree`
 * were removed, and its navigators register with `ExpoRoot`), so a host inside
 * an expo-router app passes React Navigation — the path expo-router's own error
 * message prescribes for an isolated tree. `@mapples/navigation` only imports
 * its types, so apps that never render `MapplesNavigation` do not need it.
 */
export interface NavigationBackend extends NavigationHooks {
  NavigationContainer: typeof NavigationContainer;
  NavigationIndependentTree: typeof NavigationIndependentTree;
  createNavigationContainerRef: typeof createNavigationContainerRef;
  createNativeStackNavigator: typeof createNativeStackNavigator;
  createBottomTabNavigator: typeof createBottomTabNavigator;
  createDrawerNavigator: typeof createDrawerNavigator;
  CommonActions: typeof CommonActions;
  DrawerActions: typeof DrawerActions;
}

/** The action creators the action handler dispatches. */
export type NavigationActions = Pick<
  NavigationBackend,
  'CommonActions' | 'DrawerActions'
>;

/** The hooks of the React Navigation the surrounding navigator belongs to. */
export const NavigationHooksContext = createContext<NavigationHooks>(
  expoRouterNavigationHooks,
);

export const useNavigationHooks = (): NavigationHooks =>
  useContext(NavigationHooksContext);
