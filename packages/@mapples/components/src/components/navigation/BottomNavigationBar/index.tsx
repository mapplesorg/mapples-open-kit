import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { ELEVATION, RADII, Tokens, Tone, useTones } from '@mapples/ui';
import { Platform, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useControllableState } from '../../../internal';

import { defaults } from './defaults';
import NavItem from './NavItem';
import {
  BOTTOM_NAVIGATION_FLOATING_MARGIN,
  BOTTOM_NAVIGATION_HEIGHT,
  BottomNavigationItem,
  BottomNavigationLabelVisibility,
  BottomNavigationVariant,
  readBottomNavigationItems,
} from './types';

/** Props for {@link BottomNavigationBar}. */
export interface BottomNavigationBarProps extends Omit<ViewProps, 'children'> {
  /** Three to five destinations. */
  items?: BottomNavigationItem[];
  /** The active destination's `value` (controlled). Omit to let the bar keep its own state. */
  value?: string;
  /** Initial destination while uncontrolled. Defaults to the first item. */
  defaultValue?: string;
  /** Fires with the next destination's `value` — the new value is the first argument. */
  onValueChange?: (value: string) => void;
  /** When labels show. Defaults to `always`. */
  labelVisibility?: BottomNavigationLabelVisibility;
  /** Flush bar or floating pill. Defaults to `plain`. */
  variant?: BottomNavigationVariant;
  /** Pads the bottom for the home indicator (34 pt on iOS, 8 elsewhere). Defaults to `true`. */
  safeAreaBottom?: boolean;
  /** Colour role of the active destination. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
    /** Each destination. */
    styleItem?: StyledProp<ViewStyle>;
    /** The active destination. */
    styleItemActive?: StyledProp<ViewStyle>;
    /** Inactive glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The active glyph (`color`). */
    styleIconActive?: StyledProp<ViewStyle & { color?: string }>;
    /** Inactive labels. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The pill behind the active glyph. */
    styleIndicator?: StyledProp<ViewStyle>;
    /** The count badges. */
    styleBadge?: StyledProp<ViewStyle>;
  };
}

/**
 * An in-content tab bar with an animated active pill, labels and badges.
 * It paints a bar inside the page — it is not a stand-in for a tabs
 * navigator, whose bar the app shell owns. `value` is two-way bindable so
 * sibling panels can follow it.
 *
 * @example
 * ```tsx
 * <BottomNavigationBar
 *   items={[
 *     { label: 'Home', value: 'home', iconName: 'home-outline', activeIconName: 'home' },
 *     { label: 'Search', value: 'search', iconName: 'search-outline' },
 *     { label: 'Inbox', value: 'inbox', iconName: 'mail-outline', badgeCount: 3 },
 *   ]}
 *   value={tab}
 *   onValueChange={setTab}
 * />
 * ```
 *
 * @public
 */
const BottomNavigationBar = forwardRef<
  View,
  PropsWithChildren<BottomNavigationBarProps>
>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      labelVisibility = 'always',
      variant = 'plain',
      safeAreaBottom = true,
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const destinations = readBottomNavigationItems(items);
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? destinations[0].value,
      onChange: onValueChange,
    });

    const floating = variant === 'floating';
    const safeInset = safeAreaBottom
      ? Platform.select({ ios: 34, default: 8 })
      : 0;
    const error = tones.tone('error');
    const colors = {
      active: palette.main,
      inactive: tones.resolve(Tokens.color.textSecondary),
      indicator: palette.container,
      badge: error.main,
      onBadge: error.contrast,
    };

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [
            defaults.root,
            {
              height: BOTTOM_NAVIGATION_HEIGHT + (floating ? 0 : safeInset),
              paddingBottom: floating ? 0 : safeInset,
              backgroundColor: tones.resolve(Tokens.color.surface),
            },
            floating
              ? {
                  marginHorizontal: BOTTOM_NAVIGATION_FLOATING_MARGIN,
                  marginTop: BOTTOM_NAVIGATION_FLOATING_MARGIN,
                  marginBottom: BOTTOM_NAVIGATION_FLOATING_MARGIN + safeInset,
                  paddingHorizontal: 8,
                  borderRadius: RADII.pill,
                  boxShadow: ELEVATION,
                  borderWidth: tones.isDark ? 1 : 0,
                  borderColor: tones.outline,
                }
              : {
                  borderTopWidth: 1,
                  borderTopColor: tones.divider,
                },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <StyledView styled={{ style: defaults.items }}>
          {destinations.map((item) => {
            const active = item.value === current;
            return (
              <NavItem
                key={item.value}
                item={item}
                active={active}
                showLabel={
                  labelVisibility === 'always' ||
                  (labelVisibility === 'selected' && active)
                }
                colors={colors}
                slots={{
                  styleItem: styled?.styleItem,
                  styleItemActive: styled?.styleItemActive,
                  styleIcon: styled?.styleIcon,
                  styleIconActive: styled?.styleIconActive,
                  styleLabel: styled?.styleLabel,
                  styleLabelActive: styled?.styleLabelActive,
                  styleIndicator: styled?.styleIndicator,
                  styleBadge: styled?.styleBadge,
                }}
                onPress={setCurrent}
              />
            );
          })}
        </StyledView>
      </StyledView>
    );
  },
);
BottomNavigationBar.displayName = 'BottomNavigationBar';

export default BottomNavigationBar;
