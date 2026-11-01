/**
 * Single chokepoint for expo-router's vendored copy of React Navigation.
 *
 * Expo SDK 56 blocks external `@react-navigation/*` packages inside expo-router
 * routes, so what an exported app's routes run (`RouteScreen`, `TabBarHost`,
 * `DrawerContentHost`) reads expo-router's copy. See
 * https://docs.expo.dev/router/migrate/sdk-55-to-56/.
 *
 * The hooks and chrome prop types are **not** surfaced by the public
 * `expo-router/react-navigation` entry, so they are imported from the internal
 * `expo-router/build/react-navigation/<navigator>/index` subpaths. This file is
 * the only place in the package allowed to touch those internal paths — a
 * minor expo-router release can move them, so `vendor.test.ts` imports this
 * module to fail fast if a path disappears, and the `expo-router` peer range is
 * pinned to the verified majors. The explicit `/index` matters: from SDK 58
 * expo-router has an `exports` map whose `./build/*` pattern appends `.js`, so
 * a bare directory path no longer resolves.
 *
 * A `MapplesNavigation` tree does not use this copy: it is built with the
 * host's React Navigation (`./backend`, types in `./reactNavigation`).
 */
import { BottomTabBarHeightCallbackContext } from 'expo-router/build/react-navigation/bottom-tabs/index';
// Screen-scoped hooks for the route wrapper. The vendored copies carry
// `@deprecated` tags pointing at `expo-router`'s root export; that root pulls
// the whole router in, which is exactly what this file exists to avoid.
import {
  useFocusEffect,
  useIsFocused,
  useRoute,
} from 'expo-router/build/react-navigation/core/index';

import type { NavigationHooks } from './backend';

/** What expo-router's `Tabs` hands a custom `tabBar` (SDK 58: no `navigation`). */
export type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/index';
/** What expo-router's `Drawer` hands a custom `drawerContent`. */
export type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer/index';

/** The hooks of an exported expo-router app's routes. */
export const expoRouterNavigationHooks: NavigationHooks = {
  useFocusEffect,
  useIsFocused,
  useRoute,
  BottomTabBarHeightCallbackContext,
};
