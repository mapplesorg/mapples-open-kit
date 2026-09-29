import { ComponentType, FC, useCallback, useMemo } from 'react';

import { NavigatorChrome, NavigatorChromeProvider } from '@mapples/render';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerContentComponentProps } from '../vendor';

import { chromeItemsOf, routeByKey } from './chromeItems';

export interface DrawerContentHostProps extends DrawerContentComponentProps {
  /** The saved component that draws the drawer (it contains a `DrawerItems`). */
  Chrome: ComponentType;
}

/**
 * Mounts a designed drawer as React Navigation's `drawerContent`.
 *
 * Translates the navigator's `state` / `descriptors` into the navigator-chrome
 * context the design reads; selecting a route navigates there and closes the
 * drawer, as the stock item list does. Reads nothing but React Navigation's
 * own props, so an exported expo-router app uses it as-is:
 *
 * ```tsx
 * <Drawer drawerContent={(props) => <DrawerContentHost {...props} Chrome={MainDrawer} />} />
 * ```
 */
const DrawerContentHost: FC<DrawerContentHostProps> = ({
  state,
  descriptors,
  navigation,
  Chrome,
}) => {
  const insets = useSafeAreaInsets();
  const focused = state.routes[state.index];

  const select = useCallback(
    (routeId: string) => {
      const route = routeByKey(state.routes, routeId);
      if (route.key !== focused?.key) {
        navigation.navigate(route.name, route.params);
      }
      navigation.closeDrawer();
    },
    [state.routes, navigation, focused?.key],
  );

  const close = useCallback(() => navigation.closeDrawer(), [navigation]);

  const chrome = useMemo<NavigatorChrome>(
    () => ({
      kind: 'drawer',
      items: chromeItemsOf('drawer', state, descriptors),
      activeRouteId: focused?.key,
      select,
      close,
      insets: { top: insets.top, bottom: insets.bottom },
    }),
    [
      state,
      descriptors,
      focused?.key,
      select,
      close,
      insets.top,
      insets.bottom,
    ],
  );

  return (
    <View style={{ flex: 1 }}>
      <NavigatorChromeProvider value={chrome}>
        <Chrome />
      </NavigatorChromeProvider>
    </View>
  );
};

export default DrawerContentHost;
