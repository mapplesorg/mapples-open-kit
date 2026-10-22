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
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { Glyph, useSlotColor } from '../../../internal';
import DashedLine from '../Divider/DashedLine';

import { defaults } from './defaults';
import {
  readTimelineItems,
  TIMELINE_GEOMETRY,
  TIMELINE_LEG_ICON,
  TIMELINE_LINE,
  TIMELINE_TIME_WIDTH,
  TimelineItem,
  timelineStatusOf,
  TimelineTimePlacement,
  timelineTravelled,
  TimelineVariant,
} from './types';

/** Props for {@link Timeline}. */
export interface TimelineProps extends Omit<ViewProps, 'children'> {
  /**
   * The events: `[{ kind?: stop|leg, title, subtitle?, time?, status?:
   * done|current|upcoming, statusLabel?, iconName? }]`. A `leg` draws a
   * dashed connector with a pill (`iconName` + `title`) between two stops.
   */
  items?: TimelineItem[];
  /** Marker style: a coloured dot or a circle with the item's icon. Defaults to `dot`. */
  variant?: TimelineVariant;
  /** Index of the current event: earlier ones are done, later ones upcoming (an item's own `status` wins). */
  activeIndex?: number;
  /** Colour role of the current marker and its ring (and of done markers without `doneTone`). Defaults to `primary`. */
  tone?: Tone;
  /**
   * Colour role of done events, e.g. `success`: their markers fill with it
   * and show a check, and the connectors are coloured with it up to the
   * current event. Unset, done markers take `tone` and connectors stay
   * neutral.
   */
  doneTone?: Tone;
  /**
   * Where each event's time sits: `end` of the title row, or `leading` — a
   * fixed-width column before the rail (itineraries). Defaults to `end`.
   */
  timePlacement?: TimelineTimePlacement;
  /** Fires with the item and its index when an event (or leg) is pressed. */
  onItemPress?: (item: TimelineItem, index: number) => void;
  /** Styled slots for every visual part. */
  styled?: {
    /** The list. */
    style?: StyledProp<ViewStyle>;
    /** Each event row. */
    styleItem?: StyledProp<ViewStyle>;
    /** The connector lines (its `backgroundColor` is the line colour, dashed legs included). */
    styleLine?: StyledProp<ViewStyle>;
    /** A travelled connector (with `doneTone`), merged over `styleLine`. */
    styleLineDone?: StyledProp<ViewStyle>;
    /** The marker (dot or icon circle). */
    styleDot?: StyledProp<ViewStyle>;
    /** The marker of a done event, merged over `styleDot`. */
    styleDotDone?: StyledProp<ViewStyle>;
    /** The marker of the current event, merged over `styleDot`. */
    styleDotActive?: StyledProp<ViewStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The title of the current event, merged over `styleTitle`. */
    styleTitleActive?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The time (its `width` sizes the leading column). */
    styleTime?: StyledProp<TextStyle>;
    /** The `statusLabel` text. */
    styleStatusLabel?: StyledProp<TextStyle>;
    /** A leg's pill. */
    styleLeg?: StyledProp<ViewStyle>;
    /** A leg's pill text. */
    styleLegLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A vertical rail of events with status-coloured markers and connectors —
 * order tracking, activity history, onboarding progress, itineraries with
 * transit legs. Without `activeIndex` every event counts as done unless it
 * says otherwise.
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
 * <Timeline
 *   activeIndex={2}
 *   doneTone="success"
 *   timePlacement="leading"
 *   items={[
 *     { title: 'Hotel', time: '09:00', statusLabel: 'DONE' },
 *     { kind: 'leg', title: 'Walk · 14 min', iconName: 'walk' },
 *     { title: 'Museum', time: '09:30', statusLabel: 'NOW' },
 *   ]}
 * />
 * ```
 *
 * @public
 */
const Timeline: ForwardRefExoticComponent<
  PropsWithChildren<TimelineProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TimelineProps>>(
  (
    {
      items,
      variant = 'dot',
      activeIndex,
      tone = 'primary',
      doneTone,
      timePlacement = 'end',
      onItemPress,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    const events = readTimelineItems(items, 'Timeline');
    const statuses = events.map((item, index) =>
      timelineStatusOf(item, index, activeIndex),
    );
    const geometry = TIMELINE_GEOMETRY[variant];
    const palette = tones.tone(tone);
    const donePalette = doneTone ? tones.tone(doneTone) : palette;
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    const tertiary = tones.resolve(Tokens.color.textTertiary);
    const lineColor = useSlotColor(
      styled?.styleLine,
      'backgroundColor',
      tones.divider,
    );
    const doneLineColor = useSlotColor(
      styled?.styleLineDone,
      'backgroundColor',
      donePalette.main,
    );
    const leading = timePlacement === 'leading';
    const Row = onItemPress ? StyledPressable : StyledView;

    /** Whether the connector after `index` is drawn in the done colour. */
    const travelled = (index: number) =>
      doneTone !== undefined && timelineTravelled(statuses, index);
    const isLeg = (index: number) => events[index]?.kind === 'leg';

    const connector = (
      size: ViewStyle,
      dashed: boolean,
      done: boolean,
      hidden: boolean,
    ) => (
      <StyledView
        styled={{
          style: [
            size,
            { width: TIMELINE_LINE, backgroundColor: lineColor },
            styled?.styleLine,
            done && { backgroundColor: doneLineColor },
            done && styled?.styleLineDone,
            // The SVG stroke carries a dashed connector's colour.
            dashed && { backgroundColor: 'transparent' },
            hidden && { opacity: 0 },
          ],
        }}
      >
        {dashed ? (
          <DashedLine
            orientation="vertical"
            lineStyle="dashed"
            thickness={TIMELINE_LINE}
            color={done ? doneLineColor : lineColor}
          />
        ) : null}
      </StyledView>
    );

    // In the leading column the time aligns with the title's first line; a
    // leg or an event without a time keeps the column so the rail stays put.
    const timeColumn = (time: string | undefined) =>
      leading ? (
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          numberOfLines={1}
          style={[
            {
              width: TIMELINE_TIME_WIDTH,
              paddingTop: geometry.textTop,
              color: tertiary,
            },
            styled?.styleTime,
          ]}
        >
          {time ?? ''}
        </Typography>
      ) : null;

    return (
      <StyledView
        ref={ref}
        accessibilityRole="list"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {events.map((item, index) => {
          const status = statuses[index];
          const first = index === 0;
          const last = index === events.length - 1;
          const current = status === 'current';
          const done = status === 'done';
          const rowProps = {
            accessibilityRole: onItemPress ? ('button' as const) : undefined,
            accessibilityLabel: item.title,
            onPress: onItemPress ? () => onItemPress(item, index) : undefined,
          };

          if (item.kind === 'leg') {
            return (
              <Row
                key={index}
                {...rowProps}
                styled={{ style: [defaults.item, styled?.styleItem] }}
              >
                {timeColumn(undefined)}
                <StyledView
                  styled={{ style: [defaults.rail, { width: geometry.rail }] }}
                >
                  {connector(
                    { flex: 1 },
                    true,
                    doneTone !== undefined && done,
                    false,
                  )}
                </StyledView>
                <StyledView
                  styled={{
                    style: [defaults.legTexts, last && defaults.textsLast],
                  }}
                >
                  <StyledView
                    styled={{
                      style: [
                        defaults.leg,
                        {
                          borderRadius: shape.radius.pill,
                          backgroundColor: tones.fill,
                        },
                        styled?.styleLeg,
                      ],
                    }}
                  >
                    {item.iconName ? (
                      <Icon
                        iconName={item.iconName}
                        size={TIMELINE_LEG_ICON}
                        color={secondary}
                      />
                    ) : null}
                    <Typography
                      variant={TYPOGRAPHY_PARTS.helper}
                      numberOfLines={1}
                      style={[{ color: secondary }, styled?.styleLegLabel]}
                    >
                      {item.title}
                    </Typography>
                  </StyledView>
                </StyledView>
              </Row>
            );
          }

          const showCheck = doneTone !== undefined && done;
          const markerEdge =
            variant === 'icon'
              ? geometry.dot
              : current || showCheck
                ? geometry.ring
                : geometry.dot;
          const markerBackground =
            variant === 'icon'
              ? done
                ? donePalette.main
                : current
                  ? palette.container
                  : tones.fill
              : status === 'upcoming'
                ? tones.outlineStrong
                : done
                  ? donePalette.main
                  : palette.main;
          const glyphColor = done
            ? donePalette.contrast
            : current
              ? palette.main
              : secondary;
          const statusColor = done
            ? donePalette.ink
            : current
              ? palette.ink
              : tertiary;

          return (
            <Row
              key={index}
              {...rowProps}
              styled={{
                style: [defaults.item, styled?.styleItem],
              }}
            >
              {timeColumn(item.time)}
              <StyledView
                styled={{ style: [defaults.rail, { width: geometry.rail }] }}
              >
                {connector(
                  { height: (geometry.rail - geometry.marker) / 2 },
                  isLeg(index - 1),
                  !first && travelled(index - 1),
                  first,
                )}
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
                            ? {
                                borderWidth: shape.emphasisWidth(2),
                                borderColor: palette.main,
                              }
                            : {
                                borderWidth: 3,
                                borderColor: palette.container,
                              }),
                        styled?.styleDot,
                        done && styled?.styleDotDone,
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
                    ) : showCheck ? (
                      <Glyph
                        name="check"
                        size={geometry.check}
                        color={glyphColor}
                      />
                    ) : null}
                  </StyledView>
                </StyledView>
                {connector(
                  { flex: 1 },
                  isLeg(index + 1),
                  travelled(index),
                  last,
                )}
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
                      current && styled?.styleTitleActive,
                    ]}
                  >
                    {item.title}
                  </Typography>
                  {item.statusLabel ? (
                    <Typography
                      variant={TYPOGRAPHY_PARTS.overline}
                      numberOfLines={1}
                      style={[{ color: statusColor }, styled?.styleStatusLabel]}
                    >
                      {item.statusLabel}
                    </Typography>
                  ) : null}
                  {item.time && !leading ? (
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
