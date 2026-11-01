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
  Icon,
  TYPOGRAPHY_PARTS,
  Tokens,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import { Glyph, useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import TrendArrow from './TrendArrow';
import {
  STAT_TILE_HEADER_ICON,
  STAT_TILE_TREND_ICON,
  STAT_TILE_VALUE_ICON,
  StatTileAlign,
  StatTileIconPlacement,
  StatTileTrend,
  StatTileTrendIcon,
  StatTileTrendPlacement,
  StatTileVariant,
} from './types';

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
  /** Supporting text under the value, or after the trend with `trendPlacement: 'inline'` ('vs last month'). */
  caption?: string;
  /** Direction of the change; colours `trendValue`. Defaults to `none`. */
  trend?: StatTileTrend;
  /** The change itself ('+12%'). */
  trendValue?: string;
  /** Caption on its own line (`row`) or on the trend's line after it (`inline`). Defaults to `row`. */
  trendPlacement?: StatTileTrendPlacement;
  /** Trend glyph: a chevron or a diagonal arrow (up-right/down-right). Defaults to `chevron`. */
  trendIcon?: StatTileTrendIcon;
  /** Glyph from the project icon family. */
  iconName?: string;
  /** Glyph position: end of the label row (`header`) or right before the value (`value`). Defaults to `header`. */
  iconPlacement?: StatTileIconPlacement;
  /** Surface treatment; `plain` drops the surface, border, shadow and padding. Defaults to `elevated`. */
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
    /** The glyph, in the header or before the value (`color`). */
    styleIcon?: StyledProp<ViewStyle & { color?: string }>;
  };
}

/**
 * A KPI tile: a label, a large value with its unit (and optionally a glyph
 * before it), the change coloured by `trend` and a caption, on its own line
 * or inline after the change. Tiles sit in a row or grid on dashboards; the
 * `plain` variant lays stats out bare, as in a spec strip.
 *
 * @example
 * ```tsx
 * <StatTile label="Steps" value="8,420" unit="today" trend="up" trendValue="+12%" iconName="footsteps-outline" />
 * <StatTile
 *   value="€24 310"
 *   trend="up"
 *   trendIcon="arrow"
 *   trendValue="+€1 204 (+5.2%)"
 *   trendPlacement="inline"
 *   caption="vs September"
 *   variant="plain"
 * />
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
      trendPlacement = 'row',
      trendIcon = 'chevron',
      iconName,
      iconPlacement = 'header',
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
    const elevation = useElevation();
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
    const directional = trend === 'up' || trend === 'down';
    const showTrend = !!trendValue || directional;
    const captionInline = trendPlacement === 'inline' && showTrend;
    const plain = variant === 'plain';
    const headerIcon = iconPlacement === 'header' ? iconName : undefined;
    const valueIcon = iconPlacement === 'value' ? iconName : undefined;

    const style = [
      defaults.root,
      {
        alignItems: centered ? ('center' as const) : ('stretch' as const),
        borderRadius: shape.radius.lg,
        backgroundColor: plain
          ? 'transparent'
          : variant === 'filled'
            ? tones.fill
            : tones.resolve(Tokens.color.surface),
        borderWidth:
          !plain && (variant === 'outlined' || tones.isDark)
            ? shape.borderWidth(1)
            : 0,
        borderColor: tones.outline,
      },
      plain && defaults.rootPlain,
      variant === 'elevated' && { boxShadow: elevation },
      styled?.style,
    ];

    const captionText = caption ? (
      <Typography
        variant={TYPOGRAPHY_PARTS.helper}
        numberOfLines={captionInline ? 1 : 2}
        style={[
          { color: secondary },
          captionInline && defaults.captionInline,
          centered && !captionInline && { textAlign: 'center' },
          styled?.styleCaption,
        ]}
      >
        {caption}
      </Typography>
    ) : null;

    const body = (
      <>
        {label || headerIcon ? (
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
            {headerIcon ? (
              <Icon
                iconName={headerIcon}
                size={STAT_TILE_HEADER_ICON}
                color={glyphColor}
              />
            ) : null}
          </StyledView>
        ) : null}
        {value || unit || valueIcon ? (
          <StyledView
            styled={{
              style: [
                defaults.valueRow,
                centered && { justifyContent: 'center' },
              ],
            }}
          >
            {valueIcon ? (
              <Icon
                iconName={valueIcon}
                size={STAT_TILE_VALUE_ICON}
                color={glyphColor}
                styled={{ style: defaults.valueIcon }}
              />
            ) : null}
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
            {directional && trendIcon === 'arrow' ? (
              <TrendArrow
                direction={trend}
                size={STAT_TILE_TREND_ICON}
                color={trendColor}
              />
            ) : directional ? (
              <Glyph
                name={trend === 'up' ? 'chevronUp' : 'chevronDown'}
                size={STAT_TILE_TREND_ICON}
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
            {captionInline ? captionText : null}
          </StyledView>
        ) : null}
        {captionInline ? null : captionText}
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
