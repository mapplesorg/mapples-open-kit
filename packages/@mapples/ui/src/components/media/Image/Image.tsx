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

export type ImageProps = PropsWithChildren<
  Omit<WithStyledProps<ExpoImageProps>, 'styled'> & {
    styled?: StyledProps<ViewProps> & {
      styleImage?: StyledProp<ImageStyle>;
    };
    dataSource?: string;
  }
>;

const StyledExpoImage = styled(ExpoImage);

const Image = forwardRef(
  ({ styled, source, alt, dataSource, ...props }: ImageProps, ref) => {
    const { styleImage, ...styledProps } = styled || {};

    return (
      <StyledView ref={ref} styled={styledProps} {...props}>
        <StyledExpoImage
          source={dataSource || source}
          alt={alt}
          styled={{ style: styleImage }}
        />
      </StyledView>
    );
  },
);
Image.displayName = 'Image';

export default Image;
