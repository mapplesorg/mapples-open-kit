import { forwardRef, PropsWithChildren } from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  Typography,
  WithStyledProps,
} from '@mapples/style';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { ImageStyle, ViewProps } from 'react-native';

/**
 * Props for the Image component.
 *
 * @public
 */
export type ImageProps = PropsWithChildren<
  Omit<WithStyledProps<ExpoImageProps>, 'styled'> & {
    /** Styling configuration for the image container and image itself */
    styled?: StyledProps<ViewProps> & {
      /** Image-specific styling */
      styleImage?: StyledProp<ImageStyle>;
      /** Additional styled props forwarded directly to the underlying `expo-image` component */
      styledImageProps?: StyledProps<ExpoImageProps>;
    };
    /** Alternative data source for the image */
    dataSource?: string;
  }
>;

const StyledExpoImage = styled(ExpoImage);

/**
 * A customizable image component with built-in styling support.
 *
 * The Image component extends Expo's Image component with additional styling
 * capabilities through the @mapples/style system. It supports both container
 * and image-specific styling, and can use either the `source` or `dataSource` prop.
 * `styled.style` sizes the container and the picture fills it; `styleImage`
 * overrides the picture's own size. A container with a border radius clips
 * the picture to its corners (set `overflow: 'visible'` to opt out).
 *
 * @example
 * ```tsx
 * <Image
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   alt="Example image"
 *   styled={{
 *     style: {
 *       width: 200,
 *       height: 200,
 *       borderRadius: 8
 *     },
 *     styleImage: {
 *       resizeMode: 'cover'
 *     }
 *   }}
 * />
 * ```
 *
 * @public
 */
const Image = forwardRef(
  (
    { styled, source, dataSource, alt, children, ...props }: ImageProps,
    ref,
  ) => {
    const { styleImage, styledImageProps, ...styledProps } = styled || {};

    const image = dataSource || source;

    // `styled.style` sizes the wrapper; the picture fills it unless
    // `styleImage` sizes it, and a rounded wrapper clips its corners.
    const rounded = Object.keys(Styler.flatten(styledProps.style) ?? {}).some(
      (key) => /^border\w*Radius$/.test(key),
    );
    const wrapperStyle = rounded
      ? [styler.roundedWrapper, styledProps.style]
      : styledProps.style;

    return (
      <StyledView ref={ref} styled={{ ...styledProps, style: wrapperStyle }}>
        {!!image ? (
          <StyledExpoImage
            source={image}
            styled={{
              style: [styler.image, styleImage],
              ...(styledImageProps || {}),
            }}
            {...props}
          />
        ) : (
          <StyledView styled={{ style: styler.imagePlaceholder }}>
            <Typography style={styler.imagePlaceholderText}>
              {alt || 'IMAGE'}
            </Typography>
          </StyledView>
        )}
      </StyledView>
    );
  },
);
Image.displayName = 'Image';

const styler = Styler.create({
  image: {
    width: '100%',
    height: '100%',
  },
  roundedWrapper: {
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
  },
});

export default Image;
