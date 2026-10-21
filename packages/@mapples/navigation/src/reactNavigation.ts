/**
 * TYPES of React Navigation itself (`@react-navigation/*`, optional peers): the
 * API a {@link MapplesNavigation} tree is built with (`NavigationBackend`).
 * Type-only — nothing here reaches a bundle, so an exported expo-router app,
 * which never renders `MapplesNavigation`, needs none of these packages.
 */
export type {
  BottomTabBarProps,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
export type {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerNavigationOptions,
} from '@react-navigation/drawer';
export type {
  CommonActions,
  createNavigationContainerRef,
  DrawerActions,
  NavigationContainer,
  NavigationContainerRefWithCurrent,
  NavigationIndependentTree,
  ParamListBase,
} from '@react-navigation/native';
export type { createNativeStackNavigator } from '@react-navigation/native-stack';
