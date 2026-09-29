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

import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from '../vendor';

import { chromeItemsOf, routeByKey } from './chromeItems';

export interface TabBarHostProps extends BottomTabBarProps {
  /** The saved component that draws the bar (it contains a `TabBarItems`). */
  Chrome: ComponentType;
}

/**
 * Mounts a designed tab bar as React Navigation's `tabBar`.
 *
 * Translates the navigator's `state` / `descriptors` into the navigator-chrome
 * context the design reads, forwards tab presses the way the stock bar does
 * (`tabPress` first, then navigate), and reports its measured height so
 * `useBottomTabBarHeight()` stays right. Reads nothing but React Navigation's
 * own props, so an exported expo-router app uses it as-is:
 *
 * ```tsx
 * <Tabs tabBar={(props) => <TabBarHost {...props} Chrome={MainTabBar} />} />
 * ```
 *
 * A custom `tabBar` never sees `tabBarStyle`, so `visible: false` (which the
 * runtime maps to `display: 'none'`) is honoured here by rendering nothing.
 */
const TabBarHost: FC<TabBarHostProps> = ({
  state,
  descriptors,
  navigation,
  insets,
  Chrome,
}) => {
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
      const route = routeByKey(state.routes, routeId);
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (route.key === focused?.key || event.defaultPrevented) return;
      navigation.navigate(route.name, route.params);
    },
    [state.routes, navigation, focused?.key],
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
    <View onLayout={onLayout}>
      <NavigatorChromeProvider value={chrome}>
        <Chrome />
      </NavigatorChromeProvider>
    </View>
  );
};

export default TabBarHost;
