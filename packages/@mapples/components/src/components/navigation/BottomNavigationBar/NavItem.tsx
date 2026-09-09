import { FC } from 'react';

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
  BottomNavigationItem,
} from './types';

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
  item: BottomNavigationItem;
  active: boolean;
  showLabel: boolean;
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
        <StyledView
          styled={{
            style: [
              defaults.icon,
              {
                width: BOTTOM_NAVIGATION_ICON_SIZE,
                height: BOTTOM_NAVIGATION_ICON_SIZE,
              },
            ],
          }}
        >
          <Icon
            iconName={
              active && item.activeIconName
                ? item.activeIconName
                : item.iconName
            }
            size={BOTTOM_NAVIGATION_ICON_SIZE}
            color={glyphColor}
          />
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
      {showLabel ? (
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          numberOfLines={1}
          style={[
            { color: active ? colors.active : colors.inactive },
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
