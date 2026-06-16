import { FC } from 'react';

import {
  StyledImage,
  StyledImageBackground,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { ImageProps, ImageStyle } from 'expo-image';
import { TextStyle, ViewStyle } from 'react-native';

/** Controls how text is positioned relative to the image in a carousel item. */
export type ImageCarouselMode = 'textOver' | 'textUnder';

/** Props for a single item rendered inside {@link ImageCarousel}. */
export interface ImageCarouselItemProps {
  /** The image source passed to the underlying `StyledImage` or `StyledImageBackground`. */
  image?: any;
  /** Primary text displayed over or under the image. */
  title?: string;
  /** Secondary text displayed below the title. */
  subtitle?: string;
  /** Layout mode: `'textOver'` renders text on top of the image; `'textUnder'` renders it beneath. */
  mode?: ImageCarouselMode;
  /** Additional props forwarded to the underlying `expo-image` `Image` component. */
  imageProps?: ImageProps;
  /** Styled prop applied to the outermost item container view. */
  styleItemContainer?: StyledProp<ViewStyle>;
  /** Styled prop applied to the image. */
  styleImage?: StyledProp<ImageStyle>;
  /** Styled prop applied to the text wrapper view. */
  styleTextContainer?: StyledProp<ViewStyle>;
  /** Styled prop applied to the title `Typography` element. */
  styleTitle?: StyledProp<TextStyle>;
  /** Styled prop applied to the subtitle `Typography` element. */
  styleSubtitle?: StyledProp<TextStyle>;
}

/**
 * A single slide rendered inside an {@link ImageCarousel}.
 *
 * Depending on `mode`, text is either overlaid on top of the image (`'textOver'`,
 * the default) or displayed in a separate view beneath it (`'textUnder'`).
 *
 * @param props - The component props.
 * @param props.image - Image source for the slide.
 * @param props.title - Primary heading text.
 * @param props.subtitle - Secondary description text.
 * @param props.mode - Layout mode controlling text placement.
 * @param props.styleItemContainer - Styled prop for the outer container.
 * @param props.styleImage - Styled prop for the image.
 * @param props.styleTextContainer - Styled prop for the text wrapper.
 * @param props.styleTitle - Styled prop for the title element.
 * @param props.styleSubtitle - Styled prop for the subtitle element.
 * @param props.imageProps - Extra props forwarded to the expo-image component.
 *
 * @example
 * ```tsx
 * <CarouselItem
 *   image={require('./slide.jpg')}
 *   title="Hello"
 *   subtitle="World"
 *   mode="textUnder"
 * />
 * ```
 */
const CarouselItem: FC<ImageCarouselItemProps> = ({
  image,
  title,
  subtitle,
  mode = 'textOver',
  styleItemContainer,
  styleImage,
  styleTextContainer,
  styleTitle,
  styleSubtitle,
  imageProps,
}) => {
  if (mode === 'textUnder') {
    return (
      <StyledView styled={{ style: styleItemContainer }}>
        <StyledImage
          {...imageProps}
          source={image}
          styled={{ style: styleImage }}
        />
        <StyledView styled={{ style: styleTextContainer }}>
          <Typography styled={{ style: styleTitle }}>{title}</Typography>
          <Typography styled={{ style: styleSubtitle }}>{subtitle}</Typography>
        </StyledView>
      </StyledView>
    );
  }

  return (
    <StyledImageBackground
      {...imageProps}
      source={image}
      styled={{ style: styleItemContainer, imageStyle: styleImage }}
    >
      <StyledView styled={{ style: styleTextContainer }}>
        <Typography styled={{ style: styleTitle }}>{title}</Typography>
        <Typography styled={{ style: styleSubtitle }}>{subtitle}</Typography>
      </StyledView>
    </StyledImageBackground>
  );
};

export default CarouselItem;
