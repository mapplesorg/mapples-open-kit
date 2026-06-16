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
 *    `expo-router/build/react-navigation/*` subpaths. This file is the only
 *    place in the package allowed to touch those internal paths — a minor
 *    expo-router release can move them, so `vendor.test.ts` imports this module
 *    to fail fast if a path disappears, and the `expo-router` peer range is
 *    pinned to the verified majors.
 *
 * All other modules in this package import React Navigation from `./vendor`.
 */
export {
  NavigationContainer,
  NavigationIndependentTree,
  createNavigationContainerRef,
  DrawerActions,
} from 'expo-router/react-navigation';

export {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from 'expo-router/build/react-navigation/bottom-tabs';
export {
  createDrawerNavigator,
  type DrawerNavigationOptions,
} from 'expo-router/build/react-navigation/drawer';
export { createNativeStackNavigator } from 'expo-router/build/react-navigation/native-stack';
