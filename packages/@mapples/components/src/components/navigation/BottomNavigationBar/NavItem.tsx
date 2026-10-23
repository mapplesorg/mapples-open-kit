import { FC, ReactNode } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
  useStyled,
} from '@mapples/style';
import { Icon, TYPOGRAPHY_PARTS, useShape } from '@mapples/ui';
import { omit, pick } from 'lodash';
import { Animated, TextStyle, ViewStyle } from 'react-native';

import { DURATION, useSlotColor, useTimingValue } from '../../../internal';

import { defaults } from './defaults';
import ExpandLabel from './ExpandLabel';
import {
  BOTTOM_NAVIGATION_BAR_INDICATOR,
  BOTTOM_NAVIGATION_EXPAND,
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
  /** The `expand` pill's fill. */
  fill: string;
  /** Glyph and label on the `expand` fill. */
  onFill: string;
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
  /** Whether the label shows (ignored by `expand`, whose label rides in the active pill). */
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
 * `styleIndicator` keys that size the `expand` pill. Its fill is an absolute
 * layer inside the pill, so a height or padding there could only be matched
 * with negative offsets; these go on the pill box instead.
 */
const EXPAND_BOX_KEYS = [
  'height',
  'minHeight',
  'maxHeight',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'paddingStart',
  'paddingEnd',
] as const;

/**
 * One destination of a `BottomNavigationBar`: the glyph, the label, a count
 * badge, and the active mark (a pill behind the glyph, a bar on the top
 * edge or a dot under the label) that fades in while active. With the
 * `expand` mark the item is sized to its content and, while active, grows
 * into a filled pill with the label beside the glyph.
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
  const expand = mark === 'expand';
  const progress = useTimingValue(active ? 1 : 0, {
    duration: DURATION.fast,
  });
  // The `expand` pill animates a width, a layout property the native driver
  // cannot touch, so it runs on its own JS-driven value (fill and width
  // share it to stay in step).
  const expansion = useTimingValue(active ? 1 : 0, {
    duration: DURATION.base,
    native: false,
  });
  const resolved = useStyled({ indicator: slots.styleIndicator }) as {
    indicator?: ViewStyle;
  };
  const inactiveGlyph = useSlotColor(slots.styleIcon, 'color', colors.inactive);
  const activeGlyph = useSlotColor(
    slots.styleIconActive,
    'color',
    expand ? colors.onFill : colors.active,
  );
  const glyphColor = active ? activeGlyph : inactiveGlyph;
  const markColor = colors.mark ?? colors.active;
  // A destination with no icon at all (a label-only design, or a navigator
  // route nobody gave one) is a label-only tab: the label takes the icon's
  // place — always shown, with the active pill behind it and the badge next
  // to it — instead of an empty pill over a caption.
  const iconless = !item.renderIcon && !item.iconName;
  const labelColor = active
    ? expand
      ? colors.onFill
      : colors.active
    : colors.inactive;
  const expandHeight = Math.max(BOTTOM_NAVIGATION_EXPAND.height, iconSize + 16);
  const expandBox = expand
    ? pick(resolved.indicator, EXPAND_BOX_KEYS)
    : undefined;
  const fillStyle = expand
    ? omit(resolved.indicator, EXPAND_BOX_KEYS)
    : resolved.indicator;
  // `pill` is a tinted container behind the glyph; `expand` is the tone's
  // full fill behind the glyph and label.
  const indicatorPill =
    mark === 'pill' || expand ? (
      <Animated.View
        pointerEvents="none"
        style={[
          defaults.indicator,
          {
            borderRadius: shape.radius.pill,
            backgroundColor: expand ? colors.fill : colors.indicator,
          },
          fillStyle,
          { opacity: expand ? expansion : progress },
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
  const glyph = (
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
            active && item.activeIconName ? item.activeIconName : item.iconName
          }
          size={iconSize}
          color={glyphColor}
        />
      ) : null}
      {badgeView}
    </StyledView>
  );
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
      {glyph}
    </StyledView>
  );
  const expandPill = (
    <StyledView
      styled={{
        style: [defaults.expandPill, { height: expandHeight }, expandBox],
      }}
    >
      {indicatorPill}
      {glyph}
      <ExpandLabel
        label={item.label}
        expansion={expansion}
        open={active}
        color={labelColor}
        styleLabel={slots.styleLabel}
        styleLabelActive={active ? slots.styleLabelActive : undefined}
      />
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
          expand ? defaults.itemFit : defaults.itemFill,
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
              {
                minHeight: expand
                  ? expandHeight
                  : BOTTOM_NAVIGATION_INDICATOR.height,
              },
              expandBox,
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
      {iconless
        ? null
        : expand
          ? expandPill
          : showLabel
            ? iconBox
            : withDot(iconBox)}
      {showLabel && !iconless && !expand
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
