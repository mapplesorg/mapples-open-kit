import {
  ComponentType,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { NavigatorChrome, NavigatorChromeProvider } from '@mapples/render';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useNavigationHooks } from '../backend';
import type { BottomTabBarProps as ReactNavigationTabBarProps } from '../reactNavigation';
import type { BottomTabBarProps as ExpoRouterTabBarProps } from '../vendor';

import { chromeItemsOf, routeByKey } from './chromeItems';

/**
 * What expo-router 58's tab bar adds over its older props. The peer range still
 * takes 56, whose type doesn't have them, so they are read through this.
 */
interface ExpoRouterTabSwitch {
  navigateToTab: (routeKey: string) => void;
  emitter: ReactNavigationTabBarProps['navigation'];
}

export type TabBarHostProps = (
  | ExpoRouterTabBarProps
  | ReactNavigationTabBarProps
) & {
  /** The saved component that draws the bar (it contains a `TabTemplate` or `TabBarItems`). */
  Chrome: ComponentType;
  /**
   * The bar lies over the screens instead of below them
   * (`TabBarOptions.floating`): screens keep their full height. The host then
   * keeps the design clear of the bottom safe area itself.
   */
  floating?: boolean;
};

/**
 * Mounts a designed tab bar as React Navigation's `tabBar`.
 *
 * Translates the navigator's `state` / `descriptors` into the navigator-chrome
 * context the design reads, forwards tab presses the way the stock bar does
 * (`tabPress` first, then navigate), and reports its measured height so
 * `useBottomTabBarHeight()` stays right. Reads nothing but React Navigation's
 * own props, so an exported expo-router app uses it as-is. It takes both tab
 * bar contracts: expo-router 58's tabs hand it `emitter` + `navigateToTab`,
 * React Navigation's (a `MapplesNavigation` tree) `navigation`:
 *
 * ```tsx
 * <Tabs tabBar={(props) => <TabBarHost {...props} Chrome={MainTabBar} />} />
 * ```
 *
 * A custom `tabBar` never sees `tabBarStyle`, so `visible: false` (which the
 * runtime maps to `display: 'none'`) is honoured here by rendering nothing.
 *
 * A `floating` bar is taken out of the navigator's layout and pinned to the
 * bottom edge, so the screens run underneath it. Its height is still
 * reported: a screen that wants its last row clear of the bar pads by
 * `useBottomTabBarHeight()`.
 */
const TabBarHost: FC<TabBarHostProps> = ({
  Chrome,
  floating = false,
  ...tabBar
}) => {
  const { state, descriptors, insets } = tabBar;
  const tabSwitch =
    'navigateToTab' in tabBar
      ? (tabBar as unknown as ExpoRouterTabSwitch)
      : undefined;
  const events = tabSwitch
    ? tabSwitch.emitter
    : (tabBar as unknown as ReactNavigationTabBarProps).navigation;
  const navigateToTab = tabSwitch?.navigateToTab;
  const navigation = 'navigateToTab' in tabBar ? undefined : tabBar.navigation;
  const { BottomTabBarHeightCallbackContext } = useNavigationHooks();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const focused = state.routes[state.index];
  const focusedOptions = focused
    ? descriptors[focused.key]?.options
    : undefined;
  // `tabBarStyle` is typed as an animated style; the runtime only ever sets
  // plain values on it (see `mapTabBarOptions`).
  const hidden =
    StyleSheet.flatten(focusedOptions?.tabBarStyle as StyleProp<ViewStyle>)
      ?.display === 'none';

  useEffect(() => {
    if (hidden) onHeightChange?.(0);
  }, [hidden, onHeightChange]);

  const select = useCallback(
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
      if (route.key === focused?.key || event.defaultPrevented) return;
      // expo-router's tabs switch by route key, React Navigation's by name.
      if (navigateToTab) navigateToTab(route.key);
      else if (navigation) navigation.navigate(route.name, route.params);
    },
    [state.routes, events, navigateToTab, navigation, focused?.key],
  );

  const chrome = useMemo<NavigatorChrome>(
    () => ({
      kind: 'tabs',
      items: chromeItemsOf('tabs', state, descriptors),
      activeRouteId: focused?.key,
      select,
      insets: { top: insets.top, bottom: insets.bottom },
    }),
    [state, descriptors, focused?.key, select, insets.top, insets.bottom],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) =>
      onHeightChange?.(event.nativeEvent.layout.height),
    [onHeightChange],
  );

  if (hidden) return null;

  return (
    <View
      onLayout={onLayout}
      pointerEvents={floating ? 'box-none' : undefined}
      style={
        floating ? [styles.floating, { paddingBottom: insets.bottom }] : null
      }
    >
      <NavigatorChromeProvider value={chrome}>
        <Chrome />
      </NavigatorChromeProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default TabBarHost;
