import { forwardRef, useCallback, useRef, useState } from 'react';

import { StyledFlatList, StyledProp, StyledView } from '@mapples/style';
import { ImageProps } from 'expo-image';
import { get } from 'lodash';
import {
  ImageStyle,
  ListRenderItem,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import CarouselItem, { ImageCarouselMode } from './CarouselItem';
import CarouselItemIndicator from './CarouselItemIndicator';

export interface ImageCarouselDataItem {
  image?: any;
  title?: string;
  subtitle?: string;
  id?: string | number;
}

const defaultKeyMap = {
  image: 'image',
  title: 'title',
  subtitle: 'subtitle',
  id: 'id',
};

export interface ImageCarouselProps<T extends ImageCarouselDataItem> {
  data?: T[];
  mode?: ImageCarouselMode;
  showIndicators?: boolean;
  keyMap?: Record<keyof ImageCarouselDataItem, string>;
  imageProps?: ImageProps;
  styled?: {
    style?: StyledProp<ViewStyle>;
    styleIndicator?: StyledProp<ViewStyle>;
    styleIndicatorActive?: StyledProp<ViewStyle>;
    styleItemContainer?: StyledProp<ViewStyle>;
    styleImage?: StyledProp<ImageStyle>;
    styleTextContainer?: StyledProp<ViewStyle>;
    styleTitle?: StyledProp<TextStyle>;
    styleSubtitle?: StyledProp<TextStyle>;
    styleIndicatorContainer?: StyledProp<ViewStyle>;
  };
}

const ImageCarousel = forwardRef<View, ImageCarouselProps<any>>(
  (
    {
      styled,
      keyMap = defaultKeyMap,
      data = [],
      mode = 'textOver',
      showIndicators = true,
      imageProps,
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const viewabilityConfig = useRef({
      itemVisiblePercentThreshold: 50,
    });

    const {
      styleIndicator,
      styleIndicatorActive,
      styleItemContainer,
      styleImage,
      styleTextContainer,
      styleTitle,
      styleSubtitle,
      style,
      styleIndicatorContainer,
    } = styled || {};

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
      const firstVisibleItem = viewableItems?.[0]?.index;

      if (typeof firstVisibleItem === 'number') {
        setActiveIndex(firstVisibleItem);
      }
    });

    const renderItem: ListRenderItem<any> = useCallback(
      ({ item }) => (
        <CarouselItem
          image={get(item, keyMap.image)}
          title={get(item, keyMap.title, 'Title')}
          subtitle={get(item, keyMap.subtitle, 'Subtitle')}
          mode={mode}
          styleItemContainer={styleItemContainer}
          styleImage={styleImage}
          styleTextContainer={styleTextContainer}
          styleTitle={styleTitle}
          styleSubtitle={styleSubtitle}
          imageProps={imageProps}
        />
      ),
      [
        imageProps,
        keyMap.image,
        keyMap.subtitle,
        keyMap.title,
        mode,
        styleImage,
        styleItemContainer,
        styleSubtitle,
        styleTextContainer,
        styleTitle,
      ],
    );

    return (
      <StyledView ref={ref} styled={{ style }}>
        <StyledFlatList
          data={data}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => get(item, keyMap.id, index)}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
        />
        {showIndicators && data.length > 1 && (
          <CarouselItemIndicator
            total={data.length}
            activeIndex={activeIndex}
            styleIndicator={styleIndicator}
            styleIndicatorActive={styleIndicatorActive}
            styleIndicatorContainer={styleIndicatorContainer}
          />
        )}
      </StyledView>
    );
  },
);
ImageCarousel.displayName = 'ImageCarousel';

export default ImageCarousel;
