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

export type ImageProps = PropsWithChildren<
  Omit<WithStyledProps<ExpoImageProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      styleImage?: StyledProp<ImageStyle>;
      styleContent?: StyledProp<ViewStyle>;
    };
    dataSource?: string;
  }
>;

const StyledExpoImage = styled(ExpoImage);

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
