import { useCallback } from 'react';

import type { BottomTabBarProps as ReactNavigationTabBarProps } from '../reactNavigation';
import type { BottomTabBarProps as ExpoRouterTabBarProps } from '../vendor';

import { routeByKey } from './chromeItems';

/**
 * What expo-router 58's tab bar adds over its older props. The peer range still
 * takes 56, whose type doesn't have them, so they are read through this.
 */
interface ExpoRouterTabSwitch {
  navigateToTab: (routeKey: string) => void;
  emitter: ReactNavigationTabBarProps['navigation'];
}

/** Either tab bar contract: expo-router's or React Navigation's. */
export type AnyTabBarProps = ExpoRouterTabBarProps | ReactNavigationTabBarProps;

/**
 * Switches tabs the way the stock bar does: `tabPress` first, then navigate,
 * unless the tab is already focused or a listener prevented it. It takes both
 * tab bar contracts: expo-router 58's tabs hand over `emitter` +
 * `navigateToTab`, React Navigation's (a `MapplesNavigation` tree)
 * `navigation`.
 */
const useTabBarSelect = (
  tabBar: AnyTabBarProps,
): ((routeId: string) => void) => {
  const { state } = tabBar;
  const tabSwitch =
    'navigateToTab' in tabBar
      ? (tabBar as unknown as ExpoRouterTabSwitch)
      : undefined;
  const events = tabSwitch
    ? tabSwitch.emitter
    : (tabBar as unknown as ReactNavigationTabBarProps).navigation;
  const navigateToTab = tabSwitch?.navigateToTab;
  const navigation = 'navigateToTab' in tabBar ? undefined : tabBar.navigation;
  const focusedKey = state.routes[state.index]?.key;

  return useCallback(
    (routeId: string) => {
      const route = routeByKey<{ key: string; name: string; params?: object }>(
        state.routes,
        routeId,
      );
      const event = events.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (route.key === focusedKey || event.defaultPrevented) return;
      // expo-router's tabs switch by route key, React Navigation's by name.
      if (navigateToTab) navigateToTab(route.key);
      else if (navigation) navigation.navigate(route.name, route.params);
    },
    [state.routes, events, navigateToTab, navigation, focusedKey],
  );
};

export default useTabBarSelect;
