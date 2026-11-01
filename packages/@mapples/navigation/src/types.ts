import { ComponentType, ReactNode } from 'react';

import { NavigationDocument } from '@mapples/types';
import { ColorValue } from 'react-native';

import type { NavigationBackend } from './backend';
import type {
  NavigationContainerRefWithCurrent,
  ParamListBase,
} from './reactNavigation';

/** Renders an icon for a tab/drawer item, given the runtime colour/size. */
export type IconRenderer = (props: {
  color?: ColorValue;
  size?: number;
}) => ReactNode;

/**
 * Resolves `ref(…)` option values to concrete runtime values. Supplied by the
 * host (from `@mapples/style` + `@mapples/render` contexts); stubbed in tests.
 */
export interface RefResolvers {
  /** Resolve a colour value or `ref(theme:…)` to a concrete colour. */
  resolveColor: (value?: string) => string | undefined;
  /** Resolve `ref(icon:…)` / `ref(glyph:…)` to an icon renderer. */
  resolveIcon: (value?: string) => IconRenderer | undefined;
}

/** Subset of native-stack header options the runtime sets. */
export interface StackHeaderOptionsPatch {
  headerShown?: boolean;
  title?: string;
  headerStyle?: { backgroundColor?: string };
  headerTintColor?: string;
  headerTitleStyle?: { fontFamily?: string; fontSize?: number; color?: string };
  headerBackVisible?: boolean;
  headerShadowVisible?: boolean;
}

/** Per-route native-stack options (header overrides + presentation). */
export interface StackScreenOptionsPatch extends StackHeaderOptionsPatch {
  presentation?: 'card' | 'modal' | 'transparentModal';
}

/** Subset of bottom-tabs navigator options the runtime sets. */
export interface TabBarOptionsPatch {
  tabBarStyle?: { display?: 'flex' | 'none'; backgroundColor?: string };
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarShowLabel?: boolean;
  tabBarLabelStyle?: { fontFamily?: string; fontSize?: number };
}

/** Per-route bottom-tabs item options. */
export interface TabItemOptionsPatch {
  tabBarLabel?: string;
  tabBarIcon?: IconRenderer;
}

/** Subset of drawer navigator options the runtime sets. */
export interface DrawerOptionsPatch {
  drawerPosition?: 'left' | 'right';
  drawerType?: 'front' | 'back' | 'slide';
  drawerStyle?: { backgroundColor?: string; width?: number };
  drawerActiveTintColor?: string;
  drawerInactiveTintColor?: string;
}

/** Per-route drawer item options. */
export interface DrawerItemOptionsPatch {
  drawerLabel?: string;
  drawerIcon?: IconRenderer;
}

/** A resolved navigation intent, applied to the navigation container ref. */
export type NavigationCommand =
  | {
      kind: 'navigate';
      routeName: string;
      params?: Record<string, unknown>;
      /**
       * Replace the history with the target instead of pushing it — a guard
       * redirect, or an authored navigate that must not leave a way back.
       */
      replace?: boolean;
      /**
       * A route guard sending the user to its fallback, not an authored
       * navigate. A handler drops it while a navigation it dispatched has
       * not landed yet: the authored one wins over the guard of the screen
       * being left.
       */
      guard?: boolean;
    }
  | { kind: 'goBack' }
  | { kind: 'openDrawer' }
  | { kind: 'closeDrawer' }
  | { kind: 'switchTab'; routeName: string };

/** Props for {@link MapplesNavigation}. */
export interface MapplesNavigationProps {
  document: NavigationDocument;
  /** pageUuid → component rendered for that page. */
  pages: Record<string, ComponentType<Record<string, unknown>>>;
  /** Rendered when a route references a missing page. */
  fallback?: ComponentType<{ pageUuid: string }>;
  /**
   * componentUuid → the saved component a navigator names as its custom
   * chrome (`options.tabBar.componentUuid` / `options.drawer.componentUuid`).
   * Mounted as React Navigation's `tabBar` / `drawerContent` through
   * `TabBarHost` / `DrawerContentHost`. A navigator that names a uuid missing
   * here is a host error and throws.
   */
  chrome?: Record<string, ComponentType>;
  /**
   * The React Navigation to build the tree with — container, navigators,
   * actions and hooks of one copy. Inside an expo-router 58 app that is
   * `@react-navigation/*` itself: expo-router no longer vendors a container
   * that can stand apart from its root.
   */
  backend: NavigationBackend;
  /**
   * Wrap the container in the backend's `NavigationIndependentTree` — required
   * when the host app already owns a container of the same React Navigation.
   */
  independent?: boolean;
  /**
   * Externally-created container ref. Supply one to observe/drive navigation
   * from the host (e.g. the Creator preview's selection sync). When omitted, an
   * internal ref is created. It belongs to the backend's React Navigation.
   */
  navigationRef?: NavigationContainerRefWithCurrent<ParamListBase>;
}
