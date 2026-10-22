import { FC, ReactNode } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
  useStyled,
} from '@mapples/style';
import { Icon, TYPOGRAPHY_PARTS, useShape } from '@mapples/ui';
import { Animated, TextStyle, ViewStyle } from 'react-native';

import { DURATION, useSlotColor, useTimingValue } from '../../../internal';

import { defaults } from './defaults';
import {
  BOTTOM_NAVIGATION_BAR_INDICATOR,
  BOTTOM_NAVIGATION_ICON_SIZE,
  BOTTOM_NAVIGATION_INDICATOR,
  BottomNavigationIndicator,
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
  /** Count pinned to the glyph (next to the label when there is no glyph); hidden at 0. */
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
  /** The `bar` and `dot` indicators. Defaults to `active`. */
  mark?: string;
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
  styleBadgeLabel?: StyledProp<TextStyle>;
}

export interface NavItemProps {
  item: NavItemData;
  active: boolean;
  showLabel: boolean;
  /** The mark on the active item. */
  indicator: BottomNavigationIndicator;
  /** Glyph size. Defaults to 24. */
  iconSize?: number;
  colors: NavItemColors;
  slots: NavItemSlots;
  onPress: (value: string) => void;
}

const BADGE_MAX = 99;

/**
 * One destination of a `BottomNavigationBar`: the glyph, the label, a count
 * badge, and the active mark (a pill behind the glyph, a bar on the top
 * edge or a dot under the label) that fades in while active.
 */
const NavItem: FC<NavItemProps> = ({
  item,
  active,
  showLabel,
  indicator: mark,
  iconSize = BOTTOM_NAVIGATION_ICON_SIZE,
  colors,
  slots,
  onPress,
}) => {
  const shape = useShape();
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
  const markColor = colors.mark ?? colors.active;
  // A destination with no icon at all (a label-only design, or a navigator
  // route nobody gave one) is a label-only tab: the label takes the icon's
  // place — always shown, with the active pill behind it and the badge next
  // to it — instead of an empty pill over a caption.
  const iconless = !item.renderIcon && !item.iconName;
  const labelColor = active ? colors.active : colors.inactive;
  const indicatorPill =
    mark === 'pill' ? (
      <Animated.View
        pointerEvents="none"
        style={[
          defaults.indicator,
          {
            borderRadius: shape.radius.pill,
            backgroundColor: colors.indicator,
          },
          resolved.indicator,
          { opacity: progress },
        ]}
      />
    ) : null;
  const indicatorBar =
    mark === 'bar' ? (
      <StyledView pointerEvents="none" styled={{ style: defaults.barTrack }}>
        <Animated.View
          style={[
            {
              width: BOTTOM_NAVIGATION_BAR_INDICATOR.width,
              height: BOTTOM_NAVIGATION_BAR_INDICATOR.height,
              borderBottomLeftRadius: BOTTOM_NAVIGATION_BAR_INDICATOR.height,
              borderBottomRightRadius: BOTTOM_NAVIGATION_BAR_INDICATOR.height,
              backgroundColor: markColor,
            },
            resolved.indicator,
            { opacity: progress },
          ]}
        />
      </StyledView>
    ) : null;
  // The dot hangs under whatever closes the item (the label, else the
  // glyph) so it never changes the item's height.
  const withDot = (node: ReactNode): ReactNode =>
    mark === 'dot' ? (
      <StyledView styled={{ style: defaults.dotAnchor }}>
        {node}
        <StyledView pointerEvents="none" styled={{ style: defaults.dotTrack }}>
          <Animated.View
            style={[
              defaults.dot,
              { backgroundColor: markColor },
              resolved.indicator,
              { opacity: progress },
            ]}
          />
        </StyledView>
      </StyledView>
    ) : (
      node
    );
  const badge =
    typeof item.badgeCount === 'number' && item.badgeCount > 0
      ? item.badgeCount > BADGE_MAX
        ? `${BADGE_MAX}+`
        : String(item.badgeCount)
      : null;
  const badgeView =
    badge !== null ? (
      <StyledView
        pointerEvents="none"
        styled={{
          style: [
            defaults.badge,
            !iconless && defaults.badgeAnchored,
            { backgroundColor: colors.badge },
            slots.styleBadge,
          ],
        }}
      >
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          style={[
            { color: colors.onBadge },
            defaults.badgeText,
            slots.styleBadgeLabel,
          ]}
        >
          {badge}
        </Typography>
      </StyledView>
    ) : null;
  const iconBox = (
    <StyledView
      styled={{
        style: [
          defaults.iconBox,
          {
            width: Math.max(BOTTOM_NAVIGATION_INDICATOR.width, iconSize + 40),
            height: Math.max(BOTTOM_NAVIGATION_INDICATOR.height, iconSize + 8),
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
        {badgeView}
      </StyledView>
    </StyledView>
  );

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
      {indicatorBar}
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
          {withDot(
            <Typography
              variant={TYPOGRAPHY_PARTS.label}
              numberOfLines={1}
              style={[
                defaults.labelText,
                { color: labelColor },
                slots.styleLabel,
                active && slots.styleLabelActive,
              ]}
            >
              {item.label}
            </Typography>,
          )}
          {badgeView}
        </StyledView>
      ) : null}
      {iconless ? null : showLabel ? iconBox : withDot(iconBox)}
      {showLabel && !iconless
        ? withDot(
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
            </Typography>,
          )
        : null}
    </StyledPressable>
  );
};

export default NavItem;
