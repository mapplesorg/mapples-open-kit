import { forwardRef, PropsWithChildren } from 'react';

import {
  NavigatorChromeItemProvider,
  useOptionalNavigatorChrome,
} from '@mapples/render';
import { StyledPressable, StyledProp, StyledView } from '@mapples/style';
import { View, ViewProps, ViewStyle } from 'react-native';

import { ChromeNotice } from '../../../internal';

import { defaults } from './defaults';

/** Props for {@link TabTemplate}. */
export interface TabTemplateProps extends Omit<ViewProps, 'children'> {
  /** Pads the bottom by the safe-area inset the navigator reports. Defaults to `true`. */
  safeAreaBottom?: boolean;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row of tabs. */
    style?: StyledProp<ViewStyle>;
    /** Each tab. */
    styleItem?: StyledProp<ViewStyle>;
    /** The active tab. */
    styleItemActive?: StyledProp<ViewStyle>;
  };
}

/**
 * The tabs of the navigator whose custom tab bar this element sits in, drawn
 * from a template: its children render once per route, each copy pressable
 * (pressing switches to that tab) and scoped to its route — `TabIcon` and
 * `TabLabel` draw the route's icon and label, and any element inside can
 * bind `tab.label`, `tab.active` and `tab.index`.
 *
 * It only knows its routes through the navigator-chrome context a host
 * provides — inside a saved component chosen as a tabs navigator's design.
 * Anywhere else it shows a notice saying so.
 *
 * @example
 * ```tsx
 * <View style={{ flexDirection: 'row', backgroundColor: '#fff' }}>
 *   <TabTemplate styled={{ style: { flex: 1 }, styleItem: { flex: 1 } }}>
 *     <TabIcon />
 *     <TabLabel showWhen="active" />
 *   </TabTemplate>
 * </View>
 * ```
 *
 * @public
 */
const TabTemplate = forwardRef<View, PropsWithChildren<TabTemplateProps>>(
  ({ safeAreaBottom = true, styled, children, ...rest }, ref) => {
    const chrome = useOptionalNavigatorChrome();

    if (!chrome || chrome.kind !== 'tabs') {
      return (
        <ChromeNotice message="Tab template — repeats its content for each of this navigator's tabs once the component is chosen as a tabs navigator's tab bar design." />
      );
    }

    const bottomInset = safeAreaBottom ? chrome.insets.bottom : 0;
    const count = chrome.items.length;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [defaults.root, { paddingBottom: bottomInset }, styled?.style],
        }}
        {...rest}
      >
        {chrome.items.map((item, index) => (
          <NavigatorChromeItemProvider
            key={item.routeId}
            item={item}
            index={index}
            count={count}
          >
            <StyledPressable
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.active }}
              onPress={() => chrome.select(item.routeId)}
              styled={{
                style: [
                  defaults.item,
                  styled?.styleItem,
                  item.active && styled?.styleItemActive,
                ],
              }}
            >
              {children}
            </StyledPressable>
          </NavigatorChromeItemProvider>
        ))}
      </StyledView>
    );
  },
);
TabTemplate.displayName = 'TabTemplate';

export default TabTemplate;
