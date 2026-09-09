import { forwardRef, PropsWithChildren, useCallback, useState } from 'react';

import { StyledProp, StyledScrollView, StyledView } from '@mapples/style';
import { Tokens, Tone, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useControllableState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import Indicator from './Indicator';
import Tab from './Tab';
import {
  readTabItems,
  TabItem,
  TabLayout,
  TABS_GEOMETRY,
  TabsSize,
  TabsVariant,
} from './types';

/** Props for {@link Tabs}. */
export interface TabsProps extends Omit<ViewProps, 'children'> {
  /** The tabs in order. */
  items?: TabItem[];
  /** The active tab's `value` (controlled). Omit to let the tabs keep their own state. */
  value?: string;
  /** Initial tab while uncontrolled. Defaults to the first item. */
  defaultValue?: string;
  /** Fires with the next tab's `value` — the new value is the first argument. */
  onValueChange?: (value: string) => void;
  /** Indicator style: a bar under the tab or a pill behind it. Defaults to `underline`. */
  variant?: TabsVariant;
  /** Scrolls horizontally instead of fitting the width. Defaults to `false`. */
  scrollable?: boolean;
  /** Shares the width equally between tabs (ignored when scrollable). Defaults to `true`. */
  fullWidth?: boolean;
  /** Tab height: `sm` 40, `md` 48. Defaults to `md`. */
  size?: TabsSize;
  /** Colour role of the active tab. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
    /** Each tab. */
    styleTab?: StyledProp<ViewStyle>;
    /** The active tab. */
    styleTabActive?: StyledProp<ViewStyle>;
    /** Inactive labels. */
    styleLabel?: StyledProp<TextStyle>;
    /** The active label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The sliding indicator. */
    styleIndicator?: StyledProp<ViewStyle>;
    /** The glyphs (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
    /** The count badges. */
    styleBadge?: StyledProp<ViewStyle>;
  };
}

/**
 * Text tabs with a sliding indicator, fitted to the width or scrolling.
 * `value` is two-way bindable so sibling panels can show and hide with it;
 * the tabs paint only the bar, never the panels.
 *
 * @example
 * ```tsx
 * <Tabs
 *   items={[
 *     { label: 'Upcoming', value: 'upcoming' },
 *     { label: 'Past', value: 'past', badgeCount: 2 },
 *   ]}
 *   value={tab}
 *   onValueChange={setTab}
 * />
 * ```
 *
 * @public
 */
const Tabs = forwardRef<View, PropsWithChildren<TabsProps>>(
  (
    {
      items,
      value,
      defaultValue,
      onValueChange,
      variant = 'underline',
      scrollable = false,
      fullWidth = true,
      size = 'md',
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
    const tabs = readTabItems(items);
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? tabs[0]?.value ?? '',
      onChange: onValueChange,
    });
    const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});

    const onTabLayout = useCallback((tab: string, layout: TabLayout) => {
      setLayouts((previous) => {
        const known = previous[tab];
        if (known && known.x === layout.x && known.width === layout.width) {
          return previous;
        }
        return { ...previous, [tab]: layout };
      });
    }, []);

    const underline = variant === 'underline';
    const grow = fullWidth && !scrollable;
    const geometry = TABS_GEOMETRY[size];
    const indicatorColor = useSlotColor(
      styled?.styleIndicator,
      'backgroundColor',
      underline ? palette.main : palette.container,
    );
    const error = tones.tone('error');
    const colors = {
      active: palette.main,
      inactive: tones.resolve(Tokens.color.textSecondary),
      badge: error.main,
      onBadge: error.contrast,
    };
    const activeLayout = tabs.some((tab) => tab.value === current)
      ? layouts[current]
      : undefined;

    const indicator = activeLayout ? (
      <Indicator
        layout={activeLayout}
        variant={variant}
        height={geometry.height}
        color={indicatorColor}
        styled={styled?.styleIndicator}
      />
    ) : null;

    const tabViews = tabs.map((item) => (
      <Tab
        key={item.value}
        item={item}
        active={item.value === current}
        variant={variant}
        size={size}
        grow={grow}
        colors={colors}
        slots={{
          styleTab: styled?.styleTab,
          styleTabActive: styled?.styleTabActive,
          styleLabel: styled?.styleLabel,
          styleLabelActive: styled?.styleLabelActive,
          styleIcon: styled?.styleIcon,
          styleBadge: styled?.styleBadge,
        }}
        onPress={setCurrent}
        onLayout={onTabLayout}
      />
    ));

    const content = (
      <>
        {underline ? null : indicator}
        {tabViews}
        {underline ? indicator : null}
      </>
    );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="tablist"
        styled={{
          style: [
            defaults.root,
            underline && {
              borderBottomWidth: 1,
              borderBottomColor: tones.divider,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {scrollable ? (
          <StyledScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            styled={{ contentContainerStyle: defaults.scrollContent }}
          >
            {content}
          </StyledScrollView>
        ) : (
          <StyledView
            styled={{
              style: [
                defaults.row,
                !grow && defaults.rowContent,
                !underline && defaults.rowPill,
              ],
            }}
          >
            {content}
          </StyledView>
        )}
      </StyledView>
    );
  },
);
Tabs.displayName = 'Tabs';

export default Tabs;
