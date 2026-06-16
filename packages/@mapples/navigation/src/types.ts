import { ComponentType, ReactNode } from 'react';

import { NavigationDocument } from '@mapples/types';

/** Renders an icon for a tab/drawer item, given the runtime colour/size. */
export type IconRenderer = (props: {
  color?: string;
  size?: number;
}) => ReactNode;

/**
 * Resolves `ref(…)` option values to concrete runtime values. Supplied by the
 * host (from `@mapples/style` + `@mapples/render` contexts); stubbed in tests.
 */
export interface RefResolvers {
  /** Resolve a colour value or `ref(theme:…)` to a concrete colour. */
  resolveColor: (value?: string) => string | undefined;
  /** Resolve `ref(icon:…)` to an icon renderer. */
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
  | { kind: 'navigate'; routeName: string; params?: Record<string, unknown> }
  | { kind: 'goBack' }
  | { kind: 'openDrawer' }
  | { kind: 'closeDrawer' }
  | { kind: 'switchTab'; routeName: string };

/**
 * Structural subset of React Navigation's container ref the runtime uses.
 * Typed here (rather than importing `@react-navigation/native`) so this module
 * stays free of the React Navigation dependency. A real
 * `NavigationContainerRef` satisfies it.
 */
export interface MapplesNavigationRef {
  isReady: () => boolean;
  canGoBack: () => boolean;
  goBack: () => void;
  navigate: (name: string, params?: object) => void;
  dispatch: (action: unknown) => void;
  getCurrentRoute: () => { name: string } | undefined;
  addListener: (
    type: string,
    callback: (...args: unknown[]) => void,
  ) => () => void;
}

/** Props for {@link MapplesNavigation}. */
export interface MapplesNavigationProps {
  document: NavigationDocument;
  /** pageUuid → component rendered for that page. */
  pages: Record<string, ComponentType<Record<string, unknown>>>;
  /** Rendered when a route references a missing page. */
  fallback?: ComponentType<{ pageUuid: string }>;
  /**
   * Render inside `NavigationIndependentTree` instead of a `NavigationContainer`
   * — required when the host app already owns a container (expo-router / Creator).
   */
  independent?: boolean;
  /**
   * Externally-created container ref. Supply one to observe/drive navigation
   * from the host (e.g. the Creator preview's selection sync). When omitted, an
   * internal ref is created.
   */
  navigationRef?: MapplesNavigationRef;
}
