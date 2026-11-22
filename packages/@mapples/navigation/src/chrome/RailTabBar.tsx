import { FC, useContext, useEffect, useMemo } from 'react';

import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useNavigationHooks } from '../backend';

import { chromeItemsOf } from './chromeItems';
import useTabBarSelect, { AnyTabBarProps } from './useTabBarSelect';
import { BAR_CONTROL_SIZE, barControlInset, VerticalBar } from './verticalBar';

/** The stock bar's tints, used where the navigator sets none. */
const ACTIVE_TINT = '#007AFF';
const INACTIVE_TINT = '#8E8E93';
const ICON_SIZE = 22;
/** Clear of the home indicator's own row. */
const BOTTOM_GAP = 8;

export type RailTabBarProps = AnyTabBarProps & {
  /** The device's vertical bar the tabs are drawn in. */
  bar: VerticalBar;
};

interface TintOptions {
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarStyle?: StyleProp<ViewStyle>;
}

/**
 * A tabs navigator's bar on a device with a vertical bar: the tabs as a
 * column of icons at the bottom of that bar, where the system puts its own
 * tab bar on iPhone Duo, instead of a row along the bottom of the screen.
 *
 * It is taken out of the navigator's layout — the screens already keep clear
 * of the bar through the safe area — and reports no height, so nothing pads
 * for a bottom bar that is not there. Labels are left to the icons, as in the
 * system's column; each button still carries its label for accessibility.
 */
const RailTabBar: FC<RailTabBarProps> = ({ bar, ...tabBar }) => {
  const { state, descriptors, insets } = tabBar;
  const select = useTabBarSelect(tabBar);
  const { BottomTabBarHeightCallbackContext } = useNavigationHooks();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);

  useEffect(() => {
    onHeightChange?.(0);
  }, [onHeightChange]);

  const items = useMemo(
    () => chromeItemsOf('tabs', state, descriptors),
    [state, descriptors],
  );

  const focused = state.routes[state.index];
  const options = (focused ? descriptors[focused.key]?.options : undefined) as
    | TintOptions
    | undefined;
  if (StyleSheet.flatten(options?.tabBarStyle)?.display === 'none') {
    return null;
  }
  const activeTint = options?.tabBarActiveTintColor ?? ACTIVE_TINT;
  const inactiveTint = options?.tabBarInactiveTintColor ?? INACTIVE_TINT;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.column,
        barControlInset(bar),
        { bottom: insets.bottom + BOTTOM_GAP },
      ]}
      testID="rail-tab-bar"
    >
      {items.map((item) => (
        <Pressable
          key={item.routeId}
          onPress={() => select(item.routeId)}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.active }}
          style={[styles.tab, item.active && styles.tabActive]}
          testID={`rail-tab-${item.label}`}
        >
          {item.renderIcon ? (
            item.renderIcon({
              color: item.active ? activeTint : inactiveTint,
              size: ICON_SIZE,
            })
          ) : (
            // A tab with no icon is still a tab: its initial stands in, the
            // way the column has no room for a label.
            <Text
              style={[
                styles.initial,
                { color: item.active ? activeTint : inactiveTint },
              ]}
            >
              {item.label.trim().charAt(0).toUpperCase()}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // One capsule holding every tab, like the system's column.
  column: {
    position: 'absolute',
    width: BAR_CONTROL_SIZE,
    borderRadius: BAR_CONTROL_SIZE / 2,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    overflow: 'hidden',
  },
  tab: {
    width: BAR_CONTROL_SIZE,
    height: BAR_CONTROL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(120, 120, 128, 0.2)',
    borderRadius: BAR_CONTROL_SIZE / 2,
  },
  initial: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default RailTabBar;
