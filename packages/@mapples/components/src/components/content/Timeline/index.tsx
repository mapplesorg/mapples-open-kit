import { forwardRef, PropsWithChildren } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { Icon, Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Glyph, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  readTimelineItems,
  TIMELINE_GEOMETRY,
  TIMELINE_LINE,
  TimelineItem,
  timelineStatusOf,
  TimelineVariant,
} from './types';

/** Props for {@link Timeline}. */
export interface TimelineProps extends Omit<ViewProps, 'children'> {
  /** The events: `[{ title, subtitle?, time?, status?: done|current|upcoming, iconName? }]`. */
  items?: TimelineItem[];
  /** Marker style: a coloured dot or a circle with the item's icon. Defaults to `dot`. */
  variant?: TimelineVariant;
  /** Index of the current event: earlier ones are done, later ones upcoming (an item's own `status` wins). */
  activeIndex?: number;
  /** Fires with the item and its index when an event is pressed. */
  onItemPress?: (item: TimelineItem, index: number) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The list. */
    style?: StyledProp<ViewStyle>;
    /** Each event row. */
    styleItem?: StyledProp<ViewStyle>;
    /** The connector lines. */
    styleLine?: StyledProp<ViewStyle>;
    /** The marker (dot or icon circle). */
    styleDot?: StyledProp<ViewStyle>;
    /** The marker of the current event, merged over `styleDot`. */
    styleDotActive?: StyledProp<ViewStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The time. */
    styleTime?: StyledProp<TextStyle>;
  };
}

/**
 * A vertical rail of events with status-coloured markers and connectors —
 * order tracking, activity history, onboarding progress. Without
 * `activeIndex` every event counts as done unless it says otherwise.
 *
 * @example
 * ```tsx
 * <Timeline
 *   activeIndex={1}
 *   items={[
 *     { title: 'Order placed', time: '09:12' },
 *     { title: 'Packed', subtitle: 'Warehouse Lisbon', time: '11:40' },
 *     { title: 'Out for delivery' },
 *   ]}
 * />
 * ```
 *
 * @public
 */
const Timeline = forwardRef<View, PropsWithChildren<TimelineProps>>(
  (
    {
      items,
      variant = 'dot',
      activeIndex,
      onItemPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const events = readTimelineItems(items, 'Timeline');
    const geometry = TIMELINE_GEOMETRY[variant];
    const palette = tones.tone('primary');
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const tertiary = tones.resolve(Tokens.color.textTertiary);
    const lineColor = useSlotColor(
      styled?.styleLine,
      'backgroundColor',
      tones.divider,
    );
    const Row = onItemPress ? StyledPressable : StyledView;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="list"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {events.map((item, index) => {
          const status = timelineStatusOf(item, index, activeIndex);
          const first = index === 0;
          const last = index === events.length - 1;
          const current = status === 'current';
          const done = status === 'done';

          const markerEdge =
            variant === 'icon'
              ? geometry.dot
              : current
                ? geometry.ring
                : geometry.dot;
          const markerBackground =
            variant === 'icon'
              ? done
                ? palette.main
                : current
                  ? palette.container
                  : tones.fill
              : status === 'upcoming'
                ? tones.outlineStrong
                : palette.main;
          const glyphColor = done
            ? palette.contrast
            : current
              ? palette.main
              : secondary;

          const line = (edge: 'top' | 'bottom') => (
            <StyledView
              styled={{
                style: [
                  edge === 'top'
                    ? { height: (geometry.rail - geometry.marker) / 2 }
                    : { flex: 1 },
                  { width: TIMELINE_LINE, backgroundColor: lineColor },
                  styled?.styleLine,
                  (edge === 'top' ? first : last) && { opacity: 0 },
                ],
              }}
            />
          );

          return (
            <Row
              key={index}
              accessibilityRole={onItemPress ? 'button' : undefined}
              accessibilityLabel={item.title}
              onPress={onItemPress ? () => onItemPress(item, index) : undefined}
              styled={{
                style: [defaults.item, styled?.styleItem],
              }}
            >
              <StyledView
                styled={{ style: [defaults.rail, { width: geometry.rail }] }}
              >
                {line('top')}
                <StyledView
                  styled={{
                    style: [
                      defaults.marker,
                      { width: geometry.marker, height: geometry.marker },
                    ],
                  }}
                >
                  <StyledView
                    styled={{
                      style: [
                        defaults.marker,
                        {
                          width: markerEdge,
                          height: markerEdge,
                          borderRadius: markerEdge / 2,
                          backgroundColor: markerBackground,
                        },
                        current &&
                          (variant === 'icon'
                            ? { borderWidth: 2, borderColor: palette.main }
                            : {
                                borderWidth: 3,
                                borderColor: palette.container,
                              }),
                        styled?.styleDot,
                        current && styled?.styleDotActive,
                      ],
                    }}
                  >
                    {variant === 'icon' ? (
                      item.iconName ? (
                        <Icon
                          iconName={item.iconName}
                          size={16}
                          color={glyphColor}
                        />
                      ) : (
                        <Glyph
                          name={done ? 'check' : 'dot'}
                          size={16}
                          color={glyphColor}
                        />
                      )
                    ) : null}
                  </StyledView>
                </StyledView>
                {line('bottom')}
              </StyledView>
              <StyledView
                styled={{
                  style: [
                    defaults.texts,
                    last && defaults.textsLast,
                    { paddingTop: geometry.textTop },
                  ],
                }}
              >
                <StyledView styled={{ style: defaults.titleRow }}>
                  <Typography
                    variant={TYPOGRAPHY_PARTS.body}
                    style={[
                      defaults.title,
                      { color: status === 'upcoming' ? secondary : text },
                      styled?.styleTitle,
                    ]}
                  >
                    {item.title}
                  </Typography>
                  {item.time ? (
                    <Typography
                      variant={TYPOGRAPHY_PARTS.helper}
                      numberOfLines={1}
                      style={[
                        defaults.time,
                        { color: tertiary },
                        styled?.styleTime,
                      ]}
                    >
                      {item.time}
                    </Typography>
                  ) : null}
                </StyledView>
                {item.subtitle ? (
                  <Typography
                    variant={TYPOGRAPHY_PARTS.helper}
                    style={[{ color: secondary }, styled?.styleSubtitle]}
                  >
                    {item.subtitle}
                  </Typography>
                ) : null}
              </StyledView>
            </Row>
          );
        })}
      </StyledView>
    );
  },
);
Timeline.displayName = 'Timeline';

export default Timeline;
