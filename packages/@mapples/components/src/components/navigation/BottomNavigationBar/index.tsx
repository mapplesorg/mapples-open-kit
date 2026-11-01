import { forwardRef, Fragment, PropsWithChildren } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { Tokens, Tone, useElevation, useShape, useTones } from '@mapples/ui';
import { Platform, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useBottomSafeInset, useControllableState } from '../../../internal';

import { defaults } from './defaults';
import NavItem from './NavItem';
import {
  BOTTOM_NAVIGATION_FLOATING_MARGIN,
  BOTTOM_NAVIGATION_HEIGHT,
  BOTTOM_NAVIGATION_ICON_SIZE,
  BottomNavigationIndicator,
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
  /**
   * When labels show. Defaults to `always`. Ignored by `indicator: 'expand'`,
   * which shows the label inside the active pill only.
   */
  labelVisibility?: BottomNavigationLabelVisibility;
  /**
   * Flush bar or floating pill. Defaults to `plain`. A floating bar with
   * `indicator: 'expand'` hugs its items and sits centred.
   */
  variant?: BottomNavigationVariant;
  /**
   * The mark on the active destination: `pill` behind the glyph, `bar` on
   * the item's top edge, `dot` under the label, `expand` (items sized to
   * their content; the active one grows into a filled pill with glyph and
   * label side by side, the others show the glyph only), or `none` (colour
   * only). Defaults to `pill`.
   */
  indicator?: BottomNavigationIndicator;
  /** Glyph size in pt. Defaults to 24. */
  iconSize?: number;
  /** Draws hairline separators between destinations. Defaults to `false`. */
  dividers?: boolean;
  /** Pads the bottom to clear the device's inset: at least 34 pt on iOS, 8 plus the inset elsewhere. Defaults to `true`. */
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
    /** The active mark, whichever `indicator` draws (pill, bar, dot or the `expand` fill; its height and padding size the `expand` pill). */
    styleIndicator?: StyledProp<ViewStyle>;
    /** The count badges (`backgroundColor` is the fill). */
    styleBadge?: StyledProp<ViewStyle>;
    /** The count text in the badges (`color`). */
    styleBadgeLabel?: StyledProp<TextStyle>;
    /** The separators between destinations (with `dividers`). */
    styleDivider?: StyledProp<ViewStyle>;
  };
}

/**
 * An in-content tab bar with an animated active mark (pill, top bar, dot or
 * an expanding pill that reveals the active label), labels and badges; items
 * may be label-only.
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
      indicator = 'pill',
      iconSize = BOTTOM_NAVIGATION_ICON_SIZE,
      dividers = false,
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
    const shape = useShape();
    const elevation = useElevation();
    const palette = tones.tone(tone);
    const destinations = readBottomNavigationItems(items);
    if (
      typeof iconSize !== 'number' ||
      !Number.isFinite(iconSize) ||
      iconSize <= 0
    ) {
      throw new Error(
        `BottomNavigationBar: iconSize must be a positive number (got ${String(iconSize)})`,
      );
    }
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? destinations[0].value,
      onChange: onValueChange,
    });

    const floating = variant === 'floating';
    const expand = indicator === 'expand';
    const deviceInset = useBottomSafeInset(
      Platform.select({ ios: 34, default: 8 }),
    );
    const safeInset = safeAreaBottom ? deviceInset : 0;
    const error = tones.tone('error');
    const colors = {
      active: palette.ink,
      inactive: tones.resolve(Tokens.color.textSecondary),
      indicator: palette.container,
      mark: palette.main,
      fill: palette.main,
      onFill: palette.contrast,
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
                  borderRadius: shape.radius.pill,
                  boxShadow: elevation,
                  borderWidth: tones.isDark ? shape.borderWidth(1) : 0,
                  borderColor: tones.outline,
                }
              : {
                  borderTopWidth: shape.borderWidth(1),
                  borderTopColor: tones.divider,
                },
            floating && expand && defaults.rootHug,
            styled?.style,
          ],
        }}
        {...rest}
      >
        <StyledView
          styled={{ style: [defaults.items, expand && defaults.itemsFit] }}
        >
          {destinations.map((item, index) => {
            const active = item.value === current;
            return (
              <Fragment key={item.value}>
                {dividers && index > 0 ? (
                  <StyledView
                    pointerEvents="none"
                    styled={{
                      style: [
                        defaults.divider,
                        { backgroundColor: tones.divider },
                        styled?.styleDivider,
                      ],
                    }}
                  />
                ) : null}
                <NavItem
                  item={item}
                  active={active}
                  showLabel={
                    labelVisibility === 'always' ||
                    (labelVisibility === 'selected' && active)
                  }
                  indicator={indicator}
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
                    styleBadge: styled?.styleBadge,
                    styleBadgeLabel: styled?.styleBadgeLabel,
                  }}
                  onPress={setCurrent}
                />
              </Fragment>
            );
          })}
        </StyledView>
      </StyledView>
    );
  },
);
BottomNavigationBar.displayName = 'BottomNavigationBar';

export default BottomNavigationBar;
