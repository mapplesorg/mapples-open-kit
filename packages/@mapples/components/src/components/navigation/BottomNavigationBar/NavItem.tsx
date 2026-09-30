import { FC, ReactNode } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
  useStyled,
} from '@mapples/style';
import { Icon, RADII, TYPOGRAPHY_PARTS } from '@mapples/ui';
import { Animated, TextStyle, ViewStyle } from 'react-native';

import { DURATION, useSlotColor, useTimingValue } from '../../../internal';

import { defaults } from './defaults';
import {
  BOTTOM_NAVIGATION_ICON_SIZE,
  BOTTOM_NAVIGATION_INDICATOR,
} from './types';

/**
 * What an item draws. `BottomNavigationBar` passes its destinations (glyph
 * names); `TabBarItems` passes a navigator's routes, whose icon arrives as a
 * renderer instead.
 */
export interface NavItemData {
  label: string;
  value: string;
  /** Glyph from the project icon family. */
  iconName?: string;
  /** Glyph while active; defaults to `iconName`. */
  activeIconName?: string;
  /** Count pinned to the glyph; hidden at 0. */
  badgeCount?: number;
  /** Draws the icon at the colour/size asked for — used instead of the glyph names. */
  renderIcon?: (props: { color?: string; size?: number }) => ReactNode;
}

/** Resolved colours an item paints with. */
export interface NavItemColors {
  /** Active glyph and label. */
  active: string;
  /** Inactive glyph and label. */
  inactive: string;
  /** The active pill. */
  indicator: string;
  /** Badge fill. */
  badge: string;
  /** Badge text. */
  onBadge: string;
}

/** The author slots an item accepts. */
export interface NavItemSlots {
  styleItem?: StyledProp<ViewStyle>;
  styleItemActive?: StyledProp<ViewStyle>;
  styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  styleIconActive?: StyledProp<ViewStyle & { color?: string }>;
  styleLabel?: StyledProp<TextStyle>;
  styleLabelActive?: StyledProp<TextStyle>;
  styleIndicator?: StyledProp<ViewStyle>;
  styleBadge?: StyledProp<ViewStyle>;
}

export interface NavItemProps {
  item: NavItemData;
  active: boolean;
  showLabel: boolean;
  /** Whether the active pill is drawn. Defaults to `true`. */
  showIndicator?: boolean;
  /** Glyph size. Defaults to 24. */
  iconSize?: number;
  colors: NavItemColors;
  slots: NavItemSlots;
  onPress: (value: string) => void;
}

const BADGE_MAX = 99;

/**
 * One destination of a `BottomNavigationBar`: the glyph over a pill that
 * fades in while active, the label, and a count badge.
 */
const NavItem: FC<NavItemProps> = ({
  item,
  active,
  showLabel,
  showIndicator = true,
  iconSize = BOTTOM_NAVIGATION_ICON_SIZE,
  colors,
  slots,
  onPress,
}) => {
  const progress = useTimingValue(active ? 1 : 0, {
    duration: DURATION.fast,
  });
  const resolved = useStyled({ indicator: slots.styleIndicator }) as {
    indicator?: ViewStyle;
  };
  const inactiveGlyph = useSlotColor(slots.styleIcon, 'color', colors.inactive);
  const activeGlyph = useSlotColor(
    slots.styleIconActive,
    'color',
    colors.active,
  );
  const glyphColor = active ? activeGlyph : inactiveGlyph;
  // A destination with no icon at all (a navigator route nobody gave one) is
  // a label-only tab: the label takes the icon's place — always shown, with
  // the active pill behind it — instead of an empty pill over a caption.
  const iconless = !item.renderIcon && !item.iconName;
  const labelColor = active ? colors.active : colors.inactive;
  const indicatorPill = showIndicator ? (
    <Animated.View
      pointerEvents="none"
      style={[
        defaults.indicator,
        {
          borderRadius: RADII.pill,
          backgroundColor: colors.indicator,
        },
        resolved.indicator,
        { opacity: progress },
      ]}
    />
  ) : null;
  const badge =
    typeof item.badgeCount === 'number' && item.badgeCount > 0
      ? item.badgeCount > BADGE_MAX
        ? `${BADGE_MAX}+`
        : String(item.badgeCount)
      : null;

  return (
    <StyledPressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      onPress={() => onPress(item.value)}
      styled={{
        style: [
          defaults.item,
          slots.styleItem,
          active && slots.styleItemActive,
        ],
      }}
    >
      {iconless ? (
        <StyledView
          styled={{
            style: [
              defaults.labelBox,
              { minHeight: BOTTOM_NAVIGATION_INDICATOR.height },
            ],
          }}
        >
          {indicatorPill}
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            numberOfLines={1}
            style={[
              { color: labelColor },
              slots.styleLabel,
              active && slots.styleLabelActive,
            ]}
          >
            {item.label}
          </Typography>
        </StyledView>
      ) : null}
      {iconless ? null : (
        <StyledView
          styled={{
            style: [
              defaults.iconBox,
              {
                width: BOTTOM_NAVIGATION_INDICATOR.width,
                height: BOTTOM_NAVIGATION_INDICATOR.height,
              },
            ],
          }}
        >
          {indicatorPill}
          <StyledView
            styled={{
              style: [defaults.icon, { width: iconSize, height: iconSize }],
            }}
          >
            {item.renderIcon ? (
              item.renderIcon({ color: glyphColor, size: iconSize })
            ) : item.iconName ? (
              <Icon
                iconName={
                  active && item.activeIconName
                    ? item.activeIconName
                    : item.iconName
                }
                size={iconSize}
                color={glyphColor}
              />
            ) : null}
            {badge !== null ? (
              <StyledView
                pointerEvents="none"
                styled={{
                  style: [
                    defaults.badge,
                    { backgroundColor: colors.badge },
                    slots.styleBadge,
                  ],
                }}
              >
                <Typography
                  variant={TYPOGRAPHY_PARTS.helper}
                  color={colors.onBadge}
                  style={defaults.badgeText}
                >
                  {badge}
                </Typography>
              </StyledView>
            ) : null}
          </StyledView>
        </StyledView>
      )}
      {showLabel && !iconless ? (
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          numberOfLines={1}
          style={[
            { color: labelColor },
            slots.styleLabel,
            active && slots.styleLabelActive,
          ]}
        >
          {item.label}
        </Typography>
      ) : null}
    </StyledPressable>
  );
};

export default NavItem;
