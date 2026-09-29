import { ReactNode } from 'react';

import { NavigatorChromeItem } from '@mapples/render';

import { EMPTY_ROUTE_NAME } from '../constants';

/** The React Navigation state slice the hosts read: routes and the focused index. */
interface ChromeNavigationState {
  index: number;
  routes: { key: string; name: string }[];
}

/** What a descriptor's options may carry for the chrome. */
interface ChromeItemOptions {
  title?: string;
  tabBarLabel?: unknown;
  drawerLabel?: unknown;
  tabBarIcon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => ReactNode;
  drawerIcon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => ReactNode;
}

const DEFAULT_ICON_SIZE = 24;
const DEFAULT_ICON_COLOR = '#000000';

/**
 * The chrome items of a navigator, from React Navigation's `state` and
 * `descriptors` — exactly what its own tab bar and drawer read, so a custom
 * design sees the same labels and icons the stock chrome would.
 *
 * `routeId` is the route's `key`: unique per mounted route and what the
 * host's `select` navigates by. The empty-navigator placeholder route is
 * skipped, so a navigator with no screens yields no items.
 */
export const chromeItemsOf = (
  kind: 'tabs' | 'drawer',
  state: ChromeNavigationState,
  descriptors: Record<string, { options: ChromeItemOptions }>,
): NavigatorChromeItem[] => {
  const items: NavigatorChromeItem[] = [];
  state.routes.forEach((route, index) => {
    if (route.name === EMPTY_ROUTE_NAME) return;
    const descriptor = descriptors[route.key];
    if (!descriptor) {
      throw new Error(
        `[@mapples/navigation] no descriptor for route "${route.name}" (${route.key})`,
      );
    }
    const { options } = descriptor;
    const active = index === state.index;
    const labelOption =
      kind === 'tabs' ? options.tabBarLabel : options.drawerLabel;
    const label =
      typeof labelOption === 'string'
        ? labelOption
        : (options.title ?? route.name);
    const icon = kind === 'tabs' ? options.tabBarIcon : options.drawerIcon;

    items.push({
      routeId: route.key,
      label,
      active,
      renderIcon: icon
        ? ({ color, size }) =>
            icon({
              focused: active,
              color: color ?? DEFAULT_ICON_COLOR,
              size: size ?? DEFAULT_ICON_SIZE,
            })
        : undefined,
    });
  });
  return items;
};

/** The route a chrome `select` names, by its key. */
export const routeByKey = <R extends { key: string }>(
  routes: R[],
  key: string,
): R => {
  const route = routes.find((candidate) => candidate.key === key);
  if (!route) {
    throw new Error(
      `[@mapples/navigation] chrome selected an unknown route key "${key}"`,
    );
  }
  return route;
};
