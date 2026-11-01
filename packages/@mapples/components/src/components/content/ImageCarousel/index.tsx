import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledFlatList,
  StyledProp,
  StyledView,
  Typography,
  withAlpha,
} from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useShape, useTones } from '@mapples/ui';
import { ImageProps } from 'expo-image';
import { get } from 'lodash';
import {
  FlatList,
  ImageStyle,
  LayoutChangeEvent,
  ListRenderItem,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { readSlot } from '../../../internal';
import PageControl from '../../navigation/PageControl';

import CarouselItem, { ImageCarouselMode } from './CarouselItem';
import CarouselItemIndicator from './CarouselItemIndicator';
import { defaults } from './defaults';
import {
  assertImageCarouselEnum,
  IMAGE_CAROUSEL_INDICATOR_POSITIONS,
  IMAGE_CAROUSEL_INDICATOR_VARIANTS,
  ImageCarouselIndicatorPosition,
  ImageCarouselIndicatorVariant,
} from './types';

export * from './types';

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
  /** Whether to render the page indicator. Defaults to `true`. */
  showIndicators?: boolean;
  /**
   * Indicator style: `dots` (styled entirely by the indicator slots),
   * `bars` (a stretched active bar; tapping one pages the carousel) or
   * `counter` (a "1 / 14" pill). Defaults to `dots`.
   */
  indicatorVariant?: ImageCarouselIndicatorVariant;
  /**
   * Where the indicator sits: in a row `below` the slides, or over them at
   * `bottom-center`, `bottom-end` or `top-end`. Defaults to `below`.
   */
  indicatorPosition?: ImageCarouselIndicatorPosition;
  /** Fires with the zero-based index of the slide that comes into view. */
  onIndexChange?: (index: number) => void;
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
    /** The layer over the slides that holds the children (a row by default). */
    styleOverlay?: StyledProp<ViewStyle>;
    /** The `counter` indicator's pill. */
    styleCounter?: StyledProp<ViewStyle>;
    /** The `counter` indicator's text. */
    styleCounterText?: StyledProp<TextStyle>;
  };
}

/** Alpha of the dark pill behind the counter, so it reads on any photo. */
const COUNTER_SCRIM_ALPHA = 0.55;

/** Wrapper of an indicator laid over the slides, per position. */
const overPosition: Record<
  Exclude<ImageCarouselIndicatorPosition, 'below'>,
  ViewStyle
> = {
  'bottom-center': { bottom: 0, alignItems: 'center' },
  'bottom-end': { bottom: 0, alignItems: 'flex-end' },
  'top-end': { top: 0, alignItems: 'flex-end' },
};

/**
 * Horizontally scrollable image carousel with a page indicator (dots, bars
 * or a "1 / 14" counter, below or over the slides). Children are laid over
 * the slides (back, share, favourite buttons) on a `box-none` layer, so
 * swipes between them still page the carousel. A slide shows only the text
 * its item has: a photo-only item renders no title or subtitle.
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
 * @param props.showIndicators - Whether to show the page indicator.
 * @param props.indicatorVariant - Indicator style: dots, bars or counter.
 * @param props.indicatorPosition - Indicator placement, below or over the slides.
 * @param props.onIndexChange - Fires with the index of the slide in view.
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
  PropsWithChildren<ImageCarouselProps<any>> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<ImageCarouselProps<any>>
>(
  (
    {
      styled,
      keyMap = defaultKeyMap,
      data = [],
      mode = 'textOver',
      showIndicators = true,
      indicatorVariant = 'dots',
      indicatorPosition = 'below',
      onIndexChange,
      imageProps,
      children,
    },
    ref,
  ) => {
    const variant = assertImageCarouselEnum(
      'indicatorVariant',
      indicatorVariant,
      IMAGE_CAROUSEL_INDICATOR_VARIANTS,
    );
    const position = assertImageCarouselEnum(
      'indicatorPosition',
      indicatorPosition,
      IMAGE_CAROUSEL_INDICATOR_POSITIONS,
    );
    const tones = useTones();
    const shape = useShape();
    const [activeIndex, setActiveIndex] = useState(0);
    const [pageWidth, setPageWidth] = useState(0);
    const listRef = useRef<FlatList<any>>(null);
    const activeIndexRef = useRef(0);
    const onIndexChangeRef = useRef(onIndexChange);
    useEffect(() => {
      onIndexChangeRef.current = onIndexChange;
    }, [onIndexChange]);
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
      styleOverlay,
      styleCounter,
      styleCounterText,
    } = styled || {};

    // Read once by FlatList: it reaches the latest `onIndexChange` via a ref.
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
      const firstVisibleItem = viewableItems?.[0]?.index;

      if (
        typeof firstVisibleItem === 'number' &&
        firstVisibleItem !== activeIndexRef.current
      ) {
        activeIndexRef.current = firstVisibleItem;
        setActiveIndex(firstVisibleItem);
        onIndexChangeRef.current?.(firstVisibleItem);
      }
    });

    const onListLayout = useCallback((event: LayoutChangeEvent) => {
      setPageWidth(event.nativeEvent.layout.width);
    }, []);

    // `pagingEnabled` pages by the list's own width.
    const scrollToPage = useCallback(
      (page: number) => {
        listRef.current?.scrollToOffset({
          offset: page * pageWidth,
          animated: true,
        });
      },
      [pageWidth],
    );

    const renderItem: ListRenderItem<any> = useCallback(
      ({ item }) => (
        <CarouselItem
          image={get(item, keyMap.image)}
          title={get(item, keyMap.title)}
          subtitle={get(item, keyMap.subtitle)}
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

    const total = data.length;
    const showIndicator = showIndicators && total > 1;
    const over = position !== 'below';

    const renderIndicator = () => {
      if (variant === 'counter') {
        return (
          <StyledView
            accessibilityRole="text"
            accessibilityLabel={`Slide ${activeIndex + 1} of ${total}`}
            styled={{
              style: [
                defaults.counter,
                {
                  borderRadius: shape.radius.pill,
                  backgroundColor: withAlpha(
                    tones.resolve(Tokens.color.black),
                    COUNTER_SCRIM_ALPHA,
                  ),
                },
                styleCounter,
              ],
            }}
          >
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={[
                { color: tones.resolve(Tokens.color.white) },
                styleCounterText,
              ]}
            >
              {`${activeIndex + 1} / ${total}`}
            </Typography>
          </StyledView>
        );
      }
      if (variant === 'bars') {
        // Only the slot colours carry over: the dots' sizes would undo the bar.
        const inactive = readSlot<string>(styleIndicator, 'backgroundColor');
        const active = readSlot<string>(
          styleIndicatorActive,
          'backgroundColor',
        );
        return (
          <PageControl
            variant="bars"
            count={total}
            value={activeIndex}
            onValueChange={scrollToPage}
            styled={{
              style: styleIndicatorContainer,
              styleDot: inactive ? { backgroundColor: inactive } : undefined,
              styleDotActive: active ? { backgroundColor: active } : undefined,
            }}
          />
        );
      }
      return (
        <CarouselItemIndicator
          total={total}
          activeIndex={activeIndex}
          styleIndicator={styleIndicator}
          styleIndicatorActive={styleIndicatorActive}
          styleIndicatorContainer={styleIndicatorContainer}
        />
      );
    };

    const indicator = showIndicator ? (
      over ? (
        <StyledView
          pointerEvents="box-none"
          styled={{
            style: [
              defaults.indicatorOver,
              overPosition[position as Exclude<typeof position, 'below'>],
            ],
          }}
        >
          {renderIndicator()}
        </StyledView>
      ) : variant === 'dots' ? (
        renderIndicator()
      ) : (
        <StyledView
          styled={{
            style: [
              defaults.indicatorBelow,
              variant === 'counter' && defaults.counterBelow,
            ],
          }}
        >
          {renderIndicator()}
        </StyledView>
      )
    ) : null;

    return (
      <StyledView ref={ref} styled={{ style }}>
        <View>
          <StyledFlatList
            ref={listRef}
            data={data}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            keyExtractor={(item, index) => get(item, keyMap.id, index)}
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            onLayout={onListLayout}
          />
          {over ? indicator : null}
          <StyledView
            pointerEvents="box-none"
            styled={{ style: [defaults.overlay, styleOverlay] }}
          >
            {children}
          </StyledView>
        </View>
        {over ? null : indicator}
      </StyledView>
    );
  },
);
ImageCarousel.displayName = 'ImageCarousel';

export default ImageCarousel;
