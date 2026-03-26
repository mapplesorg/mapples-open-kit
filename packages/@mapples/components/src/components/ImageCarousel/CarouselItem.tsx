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

import { ImageCarouselDataItem } from './index';

export type ImageCarouselMode = 'textOver' | 'textUnder';

export interface ImageCarouselItemProps {
  image?: any;
  title?: string;
  subtitle?: string;
  mode?: ImageCarouselMode;
  imageProps?: ImageProps;
  styleItemContainer?: StyledProp<ViewStyle>;
  styleImage?: StyledProp<ImageStyle>;
  styleTextContainer?: StyledProp<ViewStyle>;
  styleTitle?: StyledProp<TextStyle>;
  styleSubtitle?: StyledProp<TextStyle>;
}

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
