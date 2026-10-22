import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  ELEVATION,
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  useShape,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import { Glyph, useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import { StatTileAlign, StatTileTrend, StatTileVariant } from './types';

/** Props for {@link StatTile}. */
export interface StatTileProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** What the number measures ('Revenue'). */
  label?: string;
  /** The number, already formatted ('12,480'). */
  value?: string;
  /** Unit shown beside the value ('km', '%'). */
  unit?: string;
  /** Supporting text under the value ('vs last month'). */
  caption?: string;
  /** Direction of the change; colours `trendValue`. Defaults to `none`. */
  trend?: StatTileTrend;
  /** The change itself ('+12%'). */
  trendValue?: string;
  /** Glyph in the header (project icon family). */
  iconName?: string;
  /** Surface treatment. Defaults to `elevated`. */
  variant?: StatTileVariant;
  /** Text alignment. Defaults to `left`. */
  align?: StatTileAlign;
  /** Styled slots for every visual part. */
  styled?: {
    /** The tile surface. */
    style?: StyledProp<ViewStyle>;
    /** The label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The value. */
    styleValue?: StyledProp<TextStyle>;
    /** The unit. */
    styleUnit?: StyledProp<TextStyle>;
    /** The caption. */
    styleCaption?: StyledProp<TextStyle>;
    /** The trend text. */
    styleTrend?: StyledProp<TextStyle>;
    /** The header glyph (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A KPI tile: a label, a large value with its unit, the change coloured by
 * `trend` and a caption. Tiles sit in a row or grid on dashboards.
 *
 * @example
 * ```tsx
 * <StatTile label="Steps" value="8,420" unit="today" trend="up" trendValue="+12%" iconName="footsteps-outline" />
 * ```
 *
 * @public
 */
const StatTile: ForwardRefExoticComponent<
  PropsWithChildren<StatTileProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<StatTileProps>>(
  (
    {
      label,
      value,
      unit,
      caption,
      trend = 'none',
      trendValue,
      iconName,
      variant = 'elevated',
      align = 'left',
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      disabled,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const interactive = !!onPress;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      !!disabled,
    );

    const centered = align === 'center';
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', secondary);
    const trendColor =
      trend === 'up'
        ? tones.tone('success').main
        : trend === 'down'
          ? tones.tone('error').main
          : secondary;
    const showTrend = !!trendValue || trend === 'up' || trend === 'down';

    const style = [
      defaults.root,
      {
        alignItems: centered ? ('center' as const) : ('stretch' as const),
        borderRadius: shape.radius.lg,
        backgroundColor:
          variant === 'filled'
            ? tones.fill
            : tones.resolve(Tokens.color.surface),
        borderWidth: variant === 'outlined' || tones.isDark ? 1 : 0,
        borderColor: tones.outline,
      },
      variant === 'elevated' && { boxShadow: ELEVATION },
      styled?.style,
    ];

    const body = (
      <>
        {label || iconName ? (
          <StyledView
            styled={{
              style: [
                defaults.header,
                centered && { justifyContent: 'center' },
              ],
            }}
          >
            {label ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.overline}
                numberOfLines={1}
                style={[
                  { color: secondary },
                  !centered && { flex: 1 },
                  styled?.styleLabel,
                ]}
              >
                {label}
              </Typography>
            ) : null}
            {iconName ? (
              <Icon iconName={iconName} size={20} color={glyphColor} />
            ) : null}
          </StyledView>
        ) : null}
        {value || unit ? (
          <StyledView
            styled={{
              style: [
                defaults.valueRow,
                centered && { justifyContent: 'center' },
              ],
            }}
          >
            {value ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.headline}
                numberOfLines={1}
                style={[{ color: text }, styled?.styleValue]}
              >
                {value}
              </Typography>
            ) : null}
            {unit ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[defaults.unit, { color: secondary }, styled?.styleUnit]}
              >
                {unit}
              </Typography>
            ) : null}
          </StyledView>
        ) : null}
        {showTrend ? (
          <StyledView
            styled={{
              style: [defaults.trend, centered && { justifyContent: 'center' }],
            }}
          >
            {trend === 'up' || trend === 'down' ? (
              <Glyph
                name={trend === 'up' ? 'chevronUp' : 'chevronDown'}
                size={16}
                color={trendColor}
              />
            ) : null}
            {trendValue ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={1}
                style={[{ color: trendColor }, styled?.styleTrend]}
              >
                {trendValue}
              </Typography>
            ) : null}
          </StyledView>
        ) : null}
        {caption ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={2}
            style={[
              { color: secondary },
              centered && { textAlign: 'center' },
              styled?.styleCaption,
            ]}
          >
            {caption}
          </Typography>
        ) : null}
        {interactive && (interaction.pressed || interaction.hovered) ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    text,
                    interaction.pressed ? 'pressed' : 'hover',
                  ),
                },
              ],
            }}
          />
        ) : null}
      </>
    );

    const accessibilityLabel = [label, value, unit].filter(Boolean).join(' ');

    if (interactive) {
      return (
        <StyledPressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          disabled={disabled}
          {...interaction.handlers}
          styled={{ style }}
          {...rest}
        >
          {body}
        </StyledPressable>
      );
    }

    return (
      <StyledView
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        styled={{ style }}
        {...rest}
      >
        {body}
      </StyledView>
    );
  },
);
StatTile.displayName = 'StatTile';

export default StatTile;
