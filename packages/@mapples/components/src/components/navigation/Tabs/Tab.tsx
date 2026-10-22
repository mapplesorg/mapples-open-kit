import { FC } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { Icon, TYPOGRAPHY_PARTS, useShape, useTones } from '@mapples/ui';
import { LayoutChangeEvent, TextStyle, ViewStyle } from 'react-native';

import { useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  TabItem,
  TabLayout,
  TABS_GEOMETRY,
  TabsSize,
  TabsVariant,
} from './types';

/** Resolved colours a tab paints with. */
export interface TabColors {
  /** Active glyph and label. */
  active: string;
  /** Inactive glyph and label. */
  inactive: string;
  /** Badge fill. */
  badge: string;
  /** Badge text. */
  onBadge: string;
}

/** The author slots a tab accepts. */
export interface TabSlots {
  styleTab?: StyledProp<ViewStyle>;
  styleTabActive?: StyledProp<ViewStyle>;
  styleLabel?: StyledProp<TextStyle>;
  styleLabelActive?: StyledProp<TextStyle>;
  styleOverline?: StyledProp<TextStyle>;
  styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  styleBadge?: StyledProp<ViewStyle>;
}

export interface TabProps {
  item: TabItem;
  active: boolean;
  variant: TabsVariant;
  size: TabsSize;
  /** Tab height — taller than the size's when any tab has an overline. */
  height: number;
  /** Stretches the tab to share the row equally. */
  grow: boolean;
  colors: TabColors;
  slots: TabSlots;
  onPress: (value: string) => void;
  onLayout: (value: string, layout: TabLayout) => void;
}

const BADGE_MAX = 99;

/**
 * One tab of a `Tabs` bar: glyph, label and count badge over a state layer.
 * It reports its measured position so the indicator can follow it.
 */
const Tab: FC<TabProps> = ({
  item,
  active,
  variant,
  size,
  height,
  grow,
  colors,
  slots,
  onPress,
  onLayout,
}) => {
  const tones = useTones();
  const shape = useShape();
  const geometry = TABS_GEOMETRY[size];
  const interaction = useInteractionState();
  const labelColor = useSlotColor(
    active ? slots.styleLabelActive : slots.styleLabel,
    'color',
    active ? colors.active : colors.inactive,
  );
  const glyphColor = useSlotColor(slots.styleIcon, 'color', labelColor);
  const badge =
    typeof item.badgeCount === 'number' && item.badgeCount > 0
      ? item.badgeCount > BADGE_MAX
        ? `${BADGE_MAX}+`
        : String(item.badgeCount)
      : null;

  const label = (
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
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    onLayout(item.value, { x, width });
  };

  return (
    <StyledPressable
      accessibilityRole="tab"
      accessibilityLabel={
        item.overline ? `${item.overline} ${item.label}` : item.label
      }
      accessibilityState={{ selected: active }}
      onPress={() => onPress(item.value)}
      onLayout={handleLayout}
      {...interaction.handlers}
      styled={{
        style: [
          defaults.tab,
          {
            height,
            paddingHorizontal: geometry.paddingX,
            borderRadius: variant === 'pill' ? shape.radius.pill : 0,
          },
          grow && { flex: 1 },
          slots.styleTab,
          active && slots.styleTabActive,
        ],
      }}
    >
      {(interaction.pressed || interaction.hovered) && (
        <StyledView
          pointerEvents="none"
          styled={{
            style: [
              defaults.stateLayer,
              {
                backgroundColor: tones.stateLayer(
                  labelColor,
                  interaction.pressed ? 'pressed' : 'hover',
                ),
              },
            ],
          }}
        />
      )}
      {item.iconName ? (
        <Icon
          iconName={item.iconName}
          size={geometry.icon}
          color={glyphColor}
        />
      ) : null}
      {item.overline ? (
        <StyledView styled={{ style: defaults.labelStack }}>
          <Typography
            variant={TYPOGRAPHY_PARTS.overline}
            numberOfLines={1}
            style={[{ color: labelColor }, slots.styleOverline]}
          >
            {item.overline}
          </Typography>
          {label}
        </StyledView>
      ) : (
        label
      )}
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
    </StyledPressable>
  );
};

export default Tab;
