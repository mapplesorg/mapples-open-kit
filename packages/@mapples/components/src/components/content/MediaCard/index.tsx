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
  ELEVATION,
  TYPOGRAPHY_PARTS,
  Tokens,
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

import { useInteractionState } from '../../../internal';

import { defaults } from './defaults';
import {
  MEDIA_CARD_ASPECT_RATIO,
  MEDIA_CARD_THUMBNAIL,
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
  /** Primary text. */
  title?: string;
  /** Secondary text under the title. */
  subtitle?: string;
  /** Trailing detail such as a price or date. */
  meta?: string;
  /** Small pill over the photo's top-start corner ('New', 'Sale'). */
  tag?: string;
  /** Photo on top (`vertical`) or beside the text (`horizontal`). Defaults to `vertical`. */
  orientation?: MediaCardOrientation;
  /** Width ÷ height of the vertical photo. Defaults to `1.777` (16:9). */
  imageAspectRatio?: number;
  /** Surface treatment. Defaults to `elevated`. */
  variant?: MediaCardVariant;
  /** Styled slots for every visual part. */
  styled?: {
    /** The card surface. */
    style?: StyledProp<ViewStyle>;
    /** The photo (or its placeholder box). */
    styleImage?: StyledProp<ImageStyle>;
    /** The text block. */
    styleContent?: StyledProp<ViewStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The meta text. */
    styleMeta?: StyledProp<TextStyle>;
    /** The tag pill. */
    styleTag?: StyledProp<ViewStyle>;
  };
}

/**
 * A photo-topped tile for a product, place or article: image, title,
 * subtitle, a trailing price/date and an optional tag over the photo. A
 * leaf — grouped free-form content goes in `Card`.
 *
 * @example
 * ```tsx
 * <MediaCard
 *   source={{ uri: 'https://…/loft.jpg' }}
 *   title="Sunny loft"
 *   subtitle="Lisbon · 2 guests"
 *   meta="€120 / night"
 *   tag="New"
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
      title,
      subtitle,
      meta,
      tag,
      orientation = 'vertical',
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
    const interactive = !!onPress;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      !!disabled,
    );

    const horizontal = orientation === 'horizontal';
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
        borderRadius: shape.radius.lg,
        backgroundColor: variant === 'filled' ? tones.fill : surface,
        borderWidth: variant === 'outlined' || tones.isDark ? 1 : 0,
        borderColor: tones.outline,
      },
      variant === 'elevated' && { boxShadow: ELEVATION },
      styled?.style,
    ];

    const body = (
      <>
        <StyledView
          styled={{
            style: [
              defaults.media,
              { overflow: 'hidden' },
              !horizontal && { alignSelf: 'stretch' },
            ],
          }}
        >
          {source ? (
            <StyledImage
              source={source}
              contentFit="cover"
              styled={{ style: [mediaGeometry, styled?.styleImage] }}
            />
          ) : (
            <StyledView
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
                style={{ color: text }}
              >
                {tag}
              </Typography>
            </StyledView>
          ) : null}
        </StyledView>
        <StyledView
          styled={{
            style: [
              defaults.content,
              horizontal && defaults.contentHorizontal,
              styled?.styleContent,
            ],
          }}
        >
          {title ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.title}
              numberOfLines={2}
              style={[{ color: text }, styled?.styleTitle]}
            >
              {title}
            </Typography>
          ) : null}
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
        </StyledView>
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
        <StyledPressable
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={title}
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
      <StyledView ref={ref} styled={{ style }} {...rest}>
        {body}
      </StyledView>
    );
  },
);
MediaCard.displayName = 'MediaCard';

export default MediaCard;
