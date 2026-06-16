import { forwardRef, PropsWithChildren } from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { Image as ExpoImage, ImageProps as ExpoImageProps } from 'expo-image';
import { ImageStyle, ViewProps, ViewStyle } from 'react-native';

/**
 * Props for the ImageBackgroundView component.
 *
 * Combines Expo Image props with an extended `styled` object that controls the
 * outer container, the background image, and the overlaid content view
 * independently. Accepts an optional `dataSource` string that takes precedence
 * over the standard `source` prop when provided.
 *
 * @public
 */
export type ImageProps = PropsWithChildren<
  Omit<WithStyledProps<ExpoImageProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      /** Style applied to the absolutely-positioned background image */
      styleImage?: StyledProp<ImageStyle>;
      /** Style applied to the view rendered on top of the background image */
      styleContent?: StyledProp<ViewStyle>;
    };
    /** URI string that overrides `source` when present */
    dataSource?: string;
  }
>;

const StyledExpoImage = styled(ExpoImage);

/**
 * A container view with an absolutely-positioned background image.
 *
 * `ImageBackgroundView` renders a full-bleed background image (via Expo Image)
 * beneath an overlay content view. Children are placed inside the content
 * view and are rendered on top of the image. Pass `dataSource` (a URI string)
 * to override the standard `source` prop at runtime.
 *
 * @example
 * ```tsx
 * <ImageBackgroundView
 *   dataSource="https://example.com/hero.jpg"
 *   alt="Hero background"
 *   styled={{
 *     style: { flex: 1 },
 *     styleContent: { padding: 24, justifyContent: 'flex-end' },
 *   }}
 * >
 *   <Text text="Welcome" />
 * </ImageBackgroundView>
 * ```
 *
 * @public
 */
const ImageBackgroundView = forwardRef(
  (
    { styled, source, alt, children, dataSource, ...props }: ImageProps,
    ref,
  ) => {
    const { styleImage, styleContent, ...styledProps } = styled || {};

    return (
      <StyledView ref={ref} styled={styledProps} {...props}>
        <StyledExpoImage
          source={dataSource || source}
          alt={alt}
          styled={{ style: [imageConstantStyles.image, styleImage] }}
        />
        <StyledView styled={{ style: styleContent }}>{children}</StyledView>
      </StyledView>
    );
  },
);
ImageBackgroundView.displayName = 'ImageBackgroundView';
const imageConstantStyles = Styler.create({
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default ImageBackgroundView;
