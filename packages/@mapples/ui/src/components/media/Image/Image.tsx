import { forwardRef, PropsWithChildren } from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
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
  ({ styled, source, dataSource, ...props }: ImageProps, ref) => {
    const { styleImage, styledImageProps, ...styledProps } = styled || {};

    return (
      <StyledView ref={ref} styled={styledProps}>
        <StyledExpoImage
          source={dataSource || source}
          styled={{ style: styleImage, ...(styledImageProps || {}) }}
          {...props}
        />
      </StyledView>
    );
  },
);
Image.displayName = 'Image';

export default Image;
