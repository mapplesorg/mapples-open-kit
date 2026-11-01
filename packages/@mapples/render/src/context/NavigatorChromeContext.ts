import { createContext, ReactNode } from 'react';

/** What a chrome item's icon renderer receives — the same shape React Navigation hands `tabBarIcon`. */
export interface NavigatorChromeIconProps {
  color?: string;
  size?: number;
}

/**
 * One route of the navigator a chrome component draws: a tab of a tabs
 * navigator, or a row of a drawer.
 *
 * @interface NavigatorChromeItem
 */
export interface NavigatorChromeItem {
  /**
   * Host-opaque identity of the route — React Navigation's `route.key` in a
   * running app, the navigation document's route id on the Creator canvas.
   * Passed back to {@link NavigatorChrome.select}.
   */
  routeId: string;
  /** The label the route shows (tab label, drawer label or route name). */
  label: string;
  /** Whether this route is the focused one. */
  active: boolean;
  /**
   * Renders the route's icon in the colour and size the chrome asks for.
   * Absent when the route has no icon. A renderer rather than an asset
   * reference, because the canvas mounts no render provider and an exported
   * app never sees `ref(icon:…)` values.
   */
  renderIcon?: (props: NavigatorChromeIconProps) => ReactNode;
}

/**
 * The contract between a navigator and the saved component that renders its
 * chrome (a custom tab bar or drawer content). The host — React Navigation's
 * `tabBar` / `drawerContent` at runtime, the frame or the components surface
 * in the Creator — provides it; `TabBarItems` and `DrawerItems` from
 * `@mapples/components` read it.
 *
 * @interface NavigatorChrome
 */
export interface NavigatorChrome {
  /** Which chrome this is: a tabs navigator's bar or a drawer's content. */
  kind: 'tabs' | 'drawer';
  /** The navigator's routes in display order. */
  items: NavigatorChromeItem[];
  /** `routeId` of the focused route, when one is. */
  activeRouteId?: string;
  /** Focus a route — switch the tab, or navigate and close the drawer. */
  select: (routeId: string) => void;
  /** Close the drawer. Only a drawer host provides it. */
  close?: () => void;
  /** Safe-area room the chrome sits against (a tab bar pads its bottom by it). */
  insets: { top: number; bottom: number };
}

/**
 * Carries the {@link NavigatorChrome} a host provides down to the chrome
 * elements. `undefined` outside a host — a chrome element then knows it is
 * not attached to any navigator.
 */
const NavigatorChromeContext = createContext<NavigatorChrome | undefined>(
  undefined,
);

/** Provider a chrome host wraps the saved component with. */
export const NavigatorChromeProvider = NavigatorChromeContext.Provider;

export default NavigatorChromeContext;
