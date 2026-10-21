/**
 * Single chokepoint for React Navigation, consumed through expo-router's
 * vendored copy.
 *
 * Expo SDK 56 blocks external `@react-navigation/*` packages inside expo-router
 * apps, so this package must import React Navigation from expo-router instead.
 * See https://docs.expo.dev/router/migrate/sdk-55-to-56/.
 *
 * Two import surfaces are used:
 *
 * 1. The container/core symbols come from the **public** `expo-router/
 *    react-navigation` entry (it is `module.exports = require('./build/
 *    react-navigation')`, so it is a stable alias of the build index that
 *    re-exports `native → core → routers`).
 * 2. The per-navigator factories and their option types are **not** surfaced by
 *    that entry, so they are imported from the internal
 *    `expo-router/build/react-navigation/<navigator>/index` subpaths. This file
 *    is the only place in the package allowed to touch those internal paths — a
 *    minor expo-router release can move them, so `vendor.test.ts` imports this
 *    module to fail fast if a path disappears, and the `expo-router` peer range
 *    is pinned to the verified majors. The explicit `/index` matters: from SDK 58
 *    expo-router has an `exports` map whose `./build/*` pattern appends `.js`,
 *    so a bare directory path no longer resolves.
 *
 * expo-router 58 dropped `NavigationContainer` and `NavigationIndependentTree`
 * from its vendored copy (an isolated tree there needs `@react-navigation/native`
 * itself). They are typed as possibly absent; `MapplesNavigation` — rendered by
 * the Creator preview only, never by an exported expo-router app — throws when
 * they are missing.
 *
 * All other modules in this package import React Navigation from `./vendor`.
 */
import * as ExpoReactNavigation from 'expo-router/react-navigation';

export {
  createNavigationContainerRef,
  CommonActions,
  DrawerActions,
} from 'expo-router/react-navigation';

/** `undefined` on expo-router 58+ (see above). */
export const NavigationContainer:
  | typeof ExpoReactNavigation.NavigationContainer
  | undefined = ExpoReactNavigation.NavigationContainer;
/** `undefined` on expo-router 58+ (see above). */
export const NavigationIndependentTree:
  | typeof ExpoReactNavigation.NavigationIndependentTree
  | undefined = ExpoReactNavigation.NavigationIndependentTree;

export {
  createBottomTabNavigator,
  BottomTabBarHeightCallbackContext,
  type BottomTabBarProps,
  type BottomTabNavigationOptions,
} from 'expo-router/build/react-navigation/bottom-tabs/index';
export {
  createDrawerNavigator,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions,
} from 'expo-router/build/react-navigation/drawer/index';
export { createNativeStackNavigator } from 'expo-router/build/react-navigation/native-stack/index';
// Screen-scoped hooks for the route wrapper. The vendored copies carry
// `@deprecated` tags pointing at `expo-router`'s root export; that root pulls
// the whole router in, which is exactly what this file exists to avoid.
export {
  useFocusEffect,
  useIsFocused,
  useRoute,
} from 'expo-router/build/react-navigation/core/index';
