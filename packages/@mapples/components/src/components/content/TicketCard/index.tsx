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
  DISABLED_OPACITY,
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { PressableProps, TextStyle, View, ViewStyle } from 'react-native';

import {
  CONTAINER_PRESS_ROLE,
  useInteractionState,
  useSlotColor,
  useSlotSize,
} from '../../../internal';
import { CardVariant } from '../Card/types';
import DashedLine from '../Divider/DashedLine';

import { defaults } from './defaults';
import {
  TICKET_CARD_DEFAULTS,
  TicketCardOrientation,
  ticketCardMainSize,
} from './types';

/** Props for {@link TicketCard}. */
export interface TicketCardProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** `horizontal`: the perforation runs across, children above and the stub below; `vertical`: the stub sits on the end side. Defaults to `horizontal`. */
  orientation?: TicketCardOrientation;
  /** Where the perforation sits from the start edge: a fraction (`0 < x < 1`) of the ticket or points (`>= 1`). Omit to size both parts to their content. A fraction of a `horizontal` ticket needs a set height. */
  perforationOffset?: number;
  /** Surface treatment, as on `Card`. Defaults to `elevated`. */
  variant?: CardVariant;
  /** Draws a 2 pt border in `tone` (thicker when the project's outline weight is heavier). Defaults to `false`. */
  selected?: boolean;
  /** Colour role of the selected border and the stub icon. Defaults to `primary`. */
  tone?: Tone;
  /** Mutes the ticket and blocks presses. */
  disabled?: boolean;
  /** Makes the ticket a tap target (set automatically when `onPress` is wired). */
  pressable?: boolean;
  /** Inner padding of each part in points. Defaults to `16`. */
  padding?: number;
  /** Diameter of the half-circle notches at the ends of the perforation, in points. Defaults to `20`. */
  notchSize?: number;
  /** Stub headline (a seat, a gate, "Admit one"). */
  stubTitle?: string;
  /** Stub supporting line. */
  stubSubtitle?: string;
  /** Stub glyph from the project icon family (a QR code, a ticket). */
  stubIconName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The ticket surface. */
    style?: StyledProp<ViewStyle>;
    /** The main part that holds the children. */
    styleMain?: StyledProp<ViewStyle>;
    /** The stub part. */
    styleStub?: StyledProp<ViewStyle>;
    /** The perforation line (its `backgroundColor` is the dash colour, its `height` — `width` when vertical — the thickness). */
    stylePerforation?: StyledProp<ViewStyle>;
    /** Each notch (its `backgroundColor` is the notch colour — the page background by default). */
    styleNotch?: StyledProp<ViewStyle>;
    /** The stub icon (`color`, `width` as its size). */
    styleStubIcon?: StyledProp<ViewStyle>;
    /** The stub title. */
    styleStubTitle?: StyledProp<TextStyle>;
    /** The stub subtitle. */
    styleStubSubtitle?: StyledProp<TextStyle>;
  };
}

/**
 * A ticket — an event pass, a boarding stub, a coupon: a surface split in
 * two by a dashed perforation with half-circle notches cut at both of its
 * ends. Children are the main part; the stub shows `stubIconName`,
 * `stubTitle` and `stubSubtitle`, below the perforation (`horizontal`) or on
 * the end side (`vertical`). The notches are painted in the page background
 * colour, so a ticket placed on another surface sets `styleNotch`'s
 * `backgroundColor` to match it.
 *
 * @example
 * ```tsx
 * <TicketCard stubTitle="Row F · Seat 12" stubSubtitle="Admit one" stubIconName="qr-code-outline">
 *   <Typography variant="Subtitle">Kyiv Jazz Night</Typography>
 *   <Typography variant="Body">Sat 24 Oct · 19:30</Typography>
 * </TicketCard>
 * ```
 *
 * @public
 */
const TicketCard: ForwardRefExoticComponent<
  PropsWithChildren<TicketCardProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<TicketCardProps>>(
  (
    {
      orientation = 'horizontal',
      perforationOffset,
      variant = 'elevated',
      selected = false,
      tone = 'primary',
      disabled = false,
      pressable,
      padding = TICKET_CARD_DEFAULTS.padding,
      notchSize = TICKET_CARD_DEFAULTS.notchSize,
      stubTitle,
      stubSubtitle,
      stubIconName,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    if (!Number.isFinite(notchSize) || notchSize < 0) {
      throw new Error(
        `TicketCard: notchSize (${String(notchSize)}) must be a non-negative number`,
      );
    }
    const mainSize = ticketCardMainSize(perforationOffset);

    const tones = useTones();
    const shape = useShape();
    const elevation = useElevation();
    const palette = tones.tone(tone);
    const interactive = pressable || !!onPress;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      disabled,
    );

    const vertical = orientation === 'vertical';
    const surface = tones.resolve(Tokens.color.surface);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);
    // The notches below draw their arcs at this same width.
    const borderWidth = selected
      ? shape.emphasisWidth(2)
      : variant === 'outlined' || tones.isDark
        ? shape.borderWidth(1)
        : 0;
    const borderColor = selected ? palette.main : tones.outline;
    const radius = notchSize / 2;

    const lineColor = useSlotColor(
      styled?.stylePerforation,
      'backgroundColor',
      tones.outlineStrong,
    );
    const lineThickness = useSlotSize(
      styled?.stylePerforation,
      vertical ? 'width' : 'height',
      TICKET_CARD_DEFAULTS.perforationThickness,
    );
    const iconColor = useSlotColor(styled?.styleStubIcon, 'color', palette.ink);
    const iconSize = useSlotSize(styled?.styleStubIcon, 'width', 28);

    const surfaceStyle = [
      defaults.root,
      {
        flexDirection: vertical ? ('row' as const) : ('column' as const),
        borderRadius: shape.radius.lg,
        backgroundColor: variant === 'filled' ? tones.fill : surface,
        borderWidth,
        borderColor,
      },
      variant === 'elevated' && { boxShadow: elevation },
      styled?.style,
      interactive &&
        (interaction.pressed || interaction.hovered) && {
          backgroundColor: tones.stateLayer(
            text,
            interaction.pressed ? 'pressed' : 'hover',
          ),
        },
      disabled && { opacity: DISABLED_OPACITY },
    ];

    const notchBase = {
      backgroundColor: tones.resolve(Tokens.color.background),
      borderColor,
    };
    // Half circles centred on the surface's outer edge; their straight side
    // covers the surface border, their arc carries it on.
    const notches = vertical
      ? [
          {
            top: -borderWidth,
            left: 0,
            width: notchSize,
            height: radius,
            borderBottomLeftRadius: radius,
            borderBottomRightRadius: radius,
            borderWidth,
            borderTopWidth: 0,
          },
          {
            bottom: -borderWidth,
            left: 0,
            width: notchSize,
            height: radius,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderWidth,
            borderBottomWidth: 0,
          },
        ]
      : [
          {
            left: -borderWidth,
            top: 0,
            width: radius,
            height: notchSize,
            borderTopRightRadius: radius,
            borderBottomRightRadius: radius,
            borderWidth,
            borderLeftWidth: 0,
          },
          {
            right: -borderWidth,
            top: 0,
            width: radius,
            height: notchSize,
            borderTopLeftRadius: radius,
            borderBottomLeftRadius: radius,
            borderWidth,
            borderRightWidth: 0,
          },
        ];
    const lineInset = radius + TICKET_CARD_DEFAULTS.perforationInset;

    const perforation = (
      <StyledView
        pointerEvents="none"
        styled={{
          style: [
            vertical ? defaults.perforationDown : defaults.perforationAcross,
            vertical ? { width: notchSize } : { height: notchSize },
          ],
        }}
      >
        <StyledView
          styled={{
            style: [
              defaults.line,
              vertical
                ? { width: lineThickness, marginVertical: lineInset }
                : { height: lineThickness, marginHorizontal: lineInset },
              styled?.stylePerforation,
              // The SVG stroke carries the colour; the box only sizes it.
              { backgroundColor: 'transparent' },
            ],
          }}
        >
          <DashedLine
            orientation={orientation}
            lineStyle="dashed"
            thickness={lineThickness}
            color={lineColor}
          />
        </StyledView>
        {notches.map((notch, index) => (
          <StyledView
            key={index}
            styled={{
              style: [defaults.notch, notchBase, notch, styled?.styleNotch],
            }}
          />
        ))}
      </StyledView>
    );

    const main = (
      <StyledView
        styled={{
          style: [
            defaults.main,
            { padding },
            mainSize === undefined
              ? vertical && { flex: 1 }
              : vertical
                ? { width: mainSize, flexShrink: 0 }
                : { height: mainSize, flexShrink: 0 },
            styled?.styleMain,
          ],
        }}
      >
        {children}
      </StyledView>
    );

    const stub = (
      <StyledView
        styled={{
          style: [
            defaults.stub,
            { padding },
            vertical
              ? { minWidth: TICKET_CARD_DEFAULTS.stubMinSize }
              : { minHeight: TICKET_CARD_DEFAULTS.stubMinSize },
            mainSize !== undefined && { flex: 1 },
            styled?.styleStub,
          ],
        }}
      >
        {stubIconName ? (
          <Icon iconName={stubIconName} size={iconSize} color={iconColor} />
        ) : null}
        {stubTitle ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.title}
            numberOfLines={2}
            style={[defaults.stubText, { color: text }, styled?.styleStubTitle]}
          >
            {stubTitle}
          </Typography>
        ) : null}
        {stubSubtitle ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={2}
            style={[
              defaults.stubText,
              { color: secondary },
              styled?.styleStubSubtitle,
            ]}
          >
            {stubSubtitle}
          </Typography>
        ) : null}
      </StyledView>
    );

    if (interactive) {
      return (
        <StyledPressable
          ref={ref}
          accessibilityRole={CONTAINER_PRESS_ROLE}
          accessibilityState={{ selected, disabled }}
          onPress={onPress}
          disabled={disabled}
          {...interaction.handlers}
          styled={{ style: surfaceStyle }}
          {...rest}
        >
          {main}
          {perforation}
          {stub}
        </StyledPressable>
      );
    }

    return (
      <StyledView
        ref={ref}
        accessibilityState={{ selected, disabled }}
        styled={{ style: surfaceStyle }}
        {...rest}
      >
        {main}
        {perforation}
        {stub}
      </StyledView>
    );
  },
);
TicketCard.displayName = 'TicketCard';

export default TicketCard;
