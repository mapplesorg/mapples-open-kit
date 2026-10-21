import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

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

/**
 * Shape of a single data record accepted by {@link ImageCarousel}.
 *
 * Field names can be remapped via `keyMap` so any object shape is supported.
 */
export interface ImageCarouselDataItem {
  /** Image source for the slide. */
  image?: any;
  /** Primary heading text. */
  title?: string;
  /** Secondary description text. */
  subtitle?: string;
  /** Unique identifier used as the FlatList `key`. */
  id?: string | number;
}

const defaultKeyMap = {
  image: 'image',
  title: 'title',
  subtitle: 'subtitle',
  id: 'id',
};

/** Props for {@link ImageCarousel}. */
export interface ImageCarouselProps<T extends ImageCarouselDataItem> {
  /** Array of data items to render as slides. */
  data?: T[];
  /** Controls text placement: `'textOver'` (default) or `'textUnder'`. */
  mode?: ImageCarouselMode;
  /** Whether to render the dot page-indicator below the carousel. Defaults to `true`. */
  showIndicators?: boolean;
  /**
   * Maps the expected `ImageCarouselDataItem` field names to the actual keys on
   * each `data` record, enabling arbitrary data shapes without transformation.
   */
  keyMap?: Record<keyof ImageCarouselDataItem, string>;
  /** Extra props forwarded to the underlying `expo-image` component in each slide. */
  imageProps?: ImageProps;
  /** Styled props for every visual part of the carousel. */
  styled?: {
    /** Styled prop for the outermost container view. */
    style?: StyledProp<ViewStyle>;
    /** Styled prop for each indicator dot. */
    styleIndicator?: StyledProp<ViewStyle>;
    /** Additional styled prop applied to the active indicator dot. */
    styleIndicatorActive?: StyledProp<ViewStyle>;
    /** Styled prop for each slide's container view. */
    styleItemContainer?: StyledProp<ViewStyle>;
    /** Styled prop for each slide's image. */
    styleImage?: StyledProp<ImageStyle>;
    /** Styled prop for each slide's text wrapper view. */
    styleTextContainer?: StyledProp<ViewStyle>;
    /** Styled prop for each slide's title element. */
    styleTitle?: StyledProp<TextStyle>;
    /** Styled prop for each slide's subtitle element. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** Styled prop for the indicator row container. */
    styleIndicatorContainer?: StyledProp<ViewStyle>;
  };
}

/**
 * Horizontally scrollable image carousel with optional dot page indicators.
 *
 * Accepts an array of data items and renders each one as a full-width slide
 * via {@link CarouselItem}. The active slide is tracked automatically using
 * `FlatList` viewability callbacks, and the {@link CarouselItemIndicator} is
 * updated accordingly.
 *
 * Use `keyMap` to adapt objects whose field names differ from the defaults
 * (`image`, `title`, `subtitle`, `id`).
 *
 * @param props - The component props.
 * @param props.data - Array of slide data items.
 * @param props.mode - Text placement mode for each slide.
 * @param props.showIndicators - Whether to show dot indicators.
 * @param props.keyMap - Field-name remapping for data items.
 * @param props.imageProps - Extra props forwarded to the image in each slide.
 * @param props.styled - Styled props for every visual layer.
 * @param ref - Forwarded ref attached to the outermost `View`.
 *
 * @example
 * ```tsx
 * const slides = [
 *   { image: require('./a.jpg'), title: 'Slide 1', subtitle: 'Description', id: '1' },
 *   { image: require('./b.jpg'), title: 'Slide 2', subtitle: 'Description', id: '2' },
 * ];
 *
 * <ImageCarousel
 *   data={slides}
 *   mode="textUnder"
 *   showIndicators
 *   styled={{ style: { height: 200 } }}
 * />
 * ```
 */
const ImageCarousel: ForwardRefExoticComponent<
  ImageCarouselProps<any> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, ImageCarouselProps<any>>(
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
