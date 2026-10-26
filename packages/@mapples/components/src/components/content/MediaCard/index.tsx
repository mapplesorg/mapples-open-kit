import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledImage,
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import {
  Icon,
  IconButton,
  TYPOGRAPHY_PARTS,
  Tokens,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  ImageStyle,
  PressableProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useInteractionState, useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import {
  MEDIA_CARD_ACCESSORY_ICON,
  MEDIA_CARD_ASPECT_RATIO,
  MEDIA_CARD_THUMBNAIL,
  MEDIA_CARD_TITLE_LINES,
  MediaCardImagePosition,
  MediaCardOrientation,
  MediaCardVariant,
} from './types';

/** Props for {@link MediaCard}. */
export interface MediaCardProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Photo source (a uri string or an expo-image source); a tinted box shows without one. */
  source?: ImageProps['source'];
  /** Small uppercase eyebrow above the title ('Bestseller', 'Episode 12'). */
  overline?: string;
  /** Primary text. */
  title?: string;
  /** Lines the title may wrap to; `0` lifts the limit. Defaults to `2`. */
  titleLines?: number;
  /** Short text at the end of the title line, such as a rating ('4.8'). */
  titleAccessory?: string;
  /** Project glyph before `titleAccessory` ('star'); warning-toned unless `styleTitleAccessory` sets a colour. */
  titleAccessoryIconName?: string;
  /** Secondary text under the title. */
  subtitle?: string;
  /** Trailing detail such as a date, distance or plain price; a price with a struck-through original uses `price`. */
  meta?: string;
  /** Current price, shown emphasised on the last line ('$24'). */
  price?: string;
  /** Previous price, struck through and muted beside `price` ('$32'). Needs `price`. */
  originalPrice?: string;
  /** Small pill over the photo's top-start corner ('New', 'Sale'). */
  tag?: string;
  /** Glyph of a round button over the photo's top-end corner ('heart-outline'). */
  actionIconName?: string;
  /** Toggle state of the overlay button; set, the button is a controlled toggle. */
  actionSelected?: boolean;
  /** Glyph of the overlay button while `actionSelected` ('heart'). */
  actionSelectedIconName?: string;
  /** Accessibility label of the overlay button ('Save'). Required with `actionIconName`. */
  actionLabel?: string;
  /** Fires when the overlay button is pressed; the card's own `onPress` does not fire. */
  onActionPress?: PressableProps['onPress'];
  /** Photo on top (`vertical`) or beside the text (`horizontal`). Defaults to `vertical`. */
  orientation?: MediaCardOrientation;
  /** Side of the photo in the horizontal layout. Defaults to `start`. */
  imagePosition?: MediaCardImagePosition;
  /** Width ÷ height of the vertical photo. Defaults to `1.777` (16:9). */
  imageAspectRatio?: number;
  /** Surface treatment; `plain` drops the surface and padding. Defaults to `elevated`. */
  variant?: MediaCardVariant;
  /** Styled slots for every visual part. */
  styled?: {
    /** The card surface. */
    style?: StyledProp<ViewStyle>;
    /** The photo (or its placeholder box). */
    styleImage?: StyledProp<ImageStyle>;
    /** The text block. */
    styleContent?: StyledProp<ViewStyle>;
    /** The overline above the title. */
    styleOverline?: StyledProp<TextStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The title-row accessory text; its `color` also paints the glyph. */
    styleTitleAccessory?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The meta text. */
    styleMeta?: StyledProp<TextStyle>;
    /** The current price. */
    stylePrice?: StyledProp<TextStyle>;
    /** The struck-through original price. */
    styleOriginalPrice?: StyledProp<TextStyle>;
    /** The tag pill. */
    styleTag?: StyledProp<ViewStyle>;
    /** The tag text. */
    styleTagLabel?: StyledProp<TextStyle>;
    /** The overlay button over the photo. */
    styleAction?: StyledProp<ViewStyle>;
  };
}

/**
 * A photo-topped tile for a product, place or article: image, overline,
 * title (with an optional rating-style accessory), subtitle, a trailing
 * detail, a price with its struck-through original, a tag and a round action
 * (save, like) over the photo. A leaf — grouped free-form content goes in
 * `Card`. With `onPress` the card's press target is a full-size sibling
 * behind the content, never an ancestor of the overlay button (on web a
 * `<button>` inside a `<button>` is invalid HTML); the pressable's props go
 * to that target, the `ref` to the card.
 *
 * @example
 * ```tsx
 * <MediaCard
 *   source={{ uri: 'https://…/loft.jpg' }}
 *   title="Sunny loft"
 *   titleAccessory="4.8"
 *   titleAccessoryIconName="star"
 *   subtitle="Lisbon · 2 guests"
 *   price="€120"
 *   originalPrice="€150"
 *   tag="New"
 *   actionIconName="heart-outline"
 *   actionSelectedIconName="heart"
 *   actionSelected={saved}
 *   actionLabel="Save"
 *   onActionPress={toggleSaved}
 *   onPress={open}
 * />
 * ```
 *
 * @public
 */
const MediaCard: ForwardRefExoticComponent<
  PropsWithChildren<MediaCardProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<MediaCardProps>>(
  (
    {
      source,
      overline,
      title,
      titleLines = MEDIA_CARD_TITLE_LINES,
      titleAccessory,
      titleAccessoryIconName,
      subtitle,
      meta,
      price,
      originalPrice,
      tag,
      actionIconName,
      actionSelected,
      actionSelectedIconName,
      actionLabel,
      onActionPress,
      orientation = 'vertical',
      imagePosition = 'start',
      imageAspectRatio = MEDIA_CARD_ASPECT_RATIO,
      variant = 'elevated',
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
    const accessoryGlyphColor = useSlotColor(
      styled?.styleTitleAccessory,
      'color',
      tones.tone('warning').ink,
    );

    if (actionIconName && !actionLabel) {
      throw new Error(
        'MediaCard: actionLabel is required when actionIconName is set',
      );
    }
    if (originalPrice && !price) {
      throw new Error('MediaCard: originalPrice needs a price');
    }
    if (!Number.isInteger(titleLines) || titleLines < 0) {
      throw new Error(
        `MediaCard: titleLines must be a whole number ≥ 0 (got ${titleLines})`,
      );
    }

    const horizontal = orientation === 'horizontal';
    const imageAtEnd = horizontal && imagePosition === 'end';
    const plain = variant === 'plain';
    const surface = tones.resolve(Tokens.color.surface);
    const text = tones.resolve(Tokens.color.text);
    const secondary = tones.resolve(Tokens.color.textSecondary);

    const mediaGeometry = horizontal
      ? { width: MEDIA_CARD_THUMBNAIL, height: MEDIA_CARD_THUMBNAIL }
      : { width: '100%' as const, aspectRatio: imageAspectRatio };

    const style = [
      defaults.root,
      {
        flexDirection: horizontal ? ('row' as const) : ('column' as const),
        // A plain card has no surface to round — the photo rounds itself —
        // and its text runs to the card's edges, where a rounded clip would
        // cut the first letters of the last line.
        borderRadius: plain ? 0 : shape.radius.lg,
        backgroundColor: plain
          ? 'transparent'
          : variant === 'filled'
            ? tones.fill
            : surface,
        borderWidth:
          !plain && (variant === 'outlined' || tones.isDark)
            ? shape.borderWidth(1)
            : 0,
        borderColor: tones.outline,
      },
      variant === 'elevated' && { boxShadow: elevation },
      styled?.style,
    ];

    // Presses outside the overlay button fall through to the press target
    // behind the card's content.
    const passThrough = interactive ? ('none' as const) : undefined;

    const media = (
      <StyledView
        pointerEvents={interactive ? 'box-none' : undefined}
        styled={{
          style: [
            defaults.media,
            { overflow: 'hidden' },
            !horizontal && { alignSelf: 'stretch' },
            plain && { borderRadius: shape.radius.lg },
          ],
        }}
      >
        {source ? (
          <StyledImage
            source={source}
            contentFit="cover"
            pointerEvents={passThrough}
            styled={{ style: [mediaGeometry, styled?.styleImage] }}
          />
        ) : (
          <StyledView
            pointerEvents={passThrough}
            styled={{
              style: [
                mediaGeometry,
                { backgroundColor: tones.fill },
                styled?.styleImage,
              ],
            }}
          />
        )}
        {tag ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.tag,
                { borderRadius: shape.radius.pill, backgroundColor: surface },
                styled?.styleTag,
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[{ color: text }, styled?.styleTagLabel]}
            >
              {tag}
            </Typography>
          </StyledView>
        ) : null}
        {actionIconName ? (
          <IconButton
            iconName={actionIconName}
            selectedIconName={actionSelectedIconName}
            selected={actionSelected}
            variant="standard"
            size="sm"
            accessibilityLabel={actionLabel}
            onPress={onActionPress}
            styled={{
              style: [
                defaults.action,
                { backgroundColor: surface },
                styled?.styleAction,
              ],
            }}
          />
        ) : null}
      </StyledView>
    );

    const titleText = title ? (
      <Typography
        variant={TYPOGRAPHY_PARTS.title}
        numberOfLines={titleLines}
        style={[
          { color: text },
          !!titleAccessory && defaults.title,
          styled?.styleTitle,
        ]}
      >
        {title}
      </Typography>
    ) : null;

    const content = (
      <StyledView
        pointerEvents={passThrough}
        styled={{
          style: [
            defaults.content,
            horizontal && defaults.contentHorizontal,
            plain && defaults.contentPlain,
            plain && horizontal && defaults.contentPlainHorizontal,
            plain &&
              horizontal &&
              (imageAtEnd ? { paddingEnd: 12 } : { paddingStart: 12 }),
            styled?.styleContent,
          ],
        }}
      >
        {overline ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.overline}
            numberOfLines={1}
            style={[{ color: secondary }, styled?.styleOverline]}
          >
            {overline}
          </Typography>
        ) : null}
        {titleAccessory ? (
          <StyledView styled={{ style: defaults.titleRow }}>
            {titleText ?? <StyledView styled={{ style: defaults.title }} />}
            <StyledView styled={{ style: defaults.accessory }}>
              {titleAccessoryIconName ? (
                <Icon
                  iconName={titleAccessoryIconName}
                  size={MEDIA_CARD_ACCESSORY_ICON}
                  color={accessoryGlyphColor}
                />
              ) : null}
              <Typography
                variant={TYPOGRAPHY_PARTS.label}
                numberOfLines={1}
                style={[{ color: text }, styled?.styleTitleAccessory]}
              >
                {titleAccessory}
              </Typography>
            </StyledView>
          </StyledView>
        ) : (
          titleText
        )}
        {subtitle ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            numberOfLines={2}
            style={[{ color: secondary }, styled?.styleSubtitle]}
          >
            {subtitle}
          </Typography>
        ) : null}
        {meta ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.label}
            numberOfLines={1}
            style={[{ color: text }, styled?.styleMeta]}
          >
            {meta}
          </Typography>
        ) : null}
        {price ? (
          <StyledView styled={{ style: defaults.priceRow }}>
            <Typography
              variant={TYPOGRAPHY_PARTS.title}
              numberOfLines={1}
              style={[{ color: text }, styled?.stylePrice]}
            >
              {price}
            </Typography>
            {originalPrice ? (
              <Typography
                variant={TYPOGRAPHY_PARTS.helper}
                numberOfLines={1}
                style={[
                  defaults.originalPrice,
                  { color: secondary },
                  styled?.styleOriginalPrice,
                ]}
              >
                {originalPrice}
              </Typography>
            ) : null}
          </StyledView>
        ) : null}
      </StyledView>
    );

    const body = (
      <>
        {imageAtEnd ? content : media}
        {imageAtEnd ? media : content}
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

    if (interactive) {
      return (
        <StyledView ref={ref} styled={{ style }}>
          <StyledPressable
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onPress}
            disabled={disabled}
            {...interaction.handlers}
            styled={{ style: defaults.pressSurface }}
            {...rest}
          />
          {body}
        </StyledView>
      );
    }

    return (
      <StyledView ref={ref} styled={{ style }} {...rest}>
        {body}
      </StyledView>
    );
  },
);
MediaCard.displayName = 'MediaCard';

export default MediaCard;
