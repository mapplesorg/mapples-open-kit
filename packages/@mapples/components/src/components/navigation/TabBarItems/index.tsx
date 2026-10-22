import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { useOptionalNavigatorChrome } from '@mapples/render';
import { StyledProp, StyledView } from '@mapples/style';
import { Tokens, Tone, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { ChromeNotice } from '../../../internal';
import NavItem from '../BottomNavigationBar/NavItem';

import { defaults } from './defaults';
import {
  TAB_BAR_ITEMS_ICON_SIZE,
  TAB_BAR_ITEMS_MIN_HEIGHT,
  TabBarItemsIndicator,
  TabBarItemsLabelVisibility,
} from './types';

/** Props for {@link TabBarItems}. */
export interface TabBarItemsProps extends Omit<ViewProps, 'children'> {
  /** When labels show. Defaults to `always`. */
  labelVisibility?: TabBarItemsLabelVisibility;
  /** The mark behind the active icon. Defaults to `pill`. */
  indicator?: TabBarItemsIndicator;
  /** Glyph size. Defaults to 24. */
  iconSize?: number;
  /** Pads the bottom by the safe-area inset the navigator reports. Defaults to `true`. */
  safeAreaBottom?: boolean;
  /** Colour role of the active tab. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row of tabs. */
    style?: StyledProp<ViewStyle>;
    /** Each tab. */
    styleItem?: StyledProp<ViewStyle>;
    /** The active tab. */
    styleItemActive?: StyledProp<ViewStyle>;
    /** Inactive icons (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The active icon (`color`). */
    styleIconActive?: StyledProp<ViewStyle & { color?: string }>;
    /** Inactive labels. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The pill behind the active icon. */
    styleIndicator?: StyledProp<ViewStyle>;
  };
}

/**
 * The tabs of the navigator whose custom tab bar this element sits in: one
 * item per route, pressing one switches to it. It only knows its routes
 * through the navigator-chrome context a host provides — inside a saved
 * component chosen as a tabs navigator's design, at runtime and on the
 * canvas alike. Anywhere else it shows a notice saying so.
 *
 * @example
 * ```tsx
 * <View style={{ flexDirection: 'row', backgroundColor: '#fff' }}>
 *   <TabBarItems labelVisibility="selected" indicator="pill" />
 * </View>
 * ```
 *
 * @public
 */
const TabBarItems: ForwardRefExoticComponent<
  PropsWithChildren<TabBarItemsProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TabBarItemsProps>>(
  (
    {
      labelVisibility = 'always',
      indicator = 'pill',
      iconSize = TAB_BAR_ITEMS_ICON_SIZE,
      safeAreaBottom = true,
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const chrome = useOptionalNavigatorChrome();
    const tones = useTones();
    const palette = tones.tone(tone);

    if (!chrome || chrome.kind !== 'tabs') {
      return (
        <ChromeNotice message="Tab bar items — shows this navigator's tabs once the component is chosen as a tabs navigator's tab bar design." />
      );
    }

    const error = tones.tone('error');
    const colors = {
      active: palette.ink,
      inactive: tones.resolve(Tokens.color.textSecondary),
      indicator: palette.container,
      badge: error.main,
      onBadge: error.contrast,
    };
    const bottomInset = safeAreaBottom ? chrome.insets.bottom : 0;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [
            defaults.root,
            {
              minHeight: TAB_BAR_ITEMS_MIN_HEIGHT + bottomInset,
              paddingBottom: bottomInset,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {chrome.items.map((item) => (
          <NavItem
            key={item.routeId}
            item={{
              label: item.label,
              value: item.routeId,
              renderIcon: item.renderIcon,
            }}
            active={item.active}
            showLabel={
              labelVisibility === 'always' ||
              (labelVisibility === 'selected' && item.active)
            }
            showIndicator={indicator === 'pill'}
            iconSize={iconSize}
            colors={colors}
            slots={{
              styleItem: styled?.styleItem,
              styleItemActive: styled?.styleItemActive,
              styleIcon: styled?.styleIcon,
              styleIconActive: styled?.styleIconActive,
              styleLabel: styled?.styleLabel,
              styleLabelActive: styled?.styleLabelActive,
              styleIndicator: styled?.styleIndicator,
            }}
            onPress={chrome.select}
          />
        ))}
      </StyledView>
    );
  },
);
TabBarItems.displayName = 'TabBarItems';

export default TabBarItems;
