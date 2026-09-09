import { FC } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { ViewStyle } from 'react-native';

/** Props for the dot-based page indicator shown below an {@link ImageCarousel}. */
interface CarouselItemIndicatorProps {
  /** Total number of slides (dots) to render. */
  total: number;
  /** Zero-based index of the currently visible slide. */
  activeIndex: number;
  /** Styled prop applied to the row container that wraps all dots. */
  styleIndicatorContainer?: StyledProp<ViewStyle>;
  /** Styled prop applied to every dot. */
  styleIndicator?: StyledProp<ViewStyle>;
  /** Styled prop applied to the currently active dot (merged on top of `styleIndicator`). */
  styleIndicatorActive?: StyledProp<ViewStyle>;
}

/**
 * Row of dot indicators that reflect the current slide position in an
 * {@link ImageCarousel}.
 *
 * Renders `total` dots and highlights the one at `activeIndex`.
 *
 * @param props - The component props.
 * @param props.total - Number of dots to render.
 * @param props.activeIndex - Index of the active dot.
 * @param props.styleIndicatorContainer - Styled prop for the container row.
 * @param props.styleIndicator - Styled prop applied to every dot.
 * @param props.styleIndicatorActive - Additional styled prop for the active dot.
 *
 * @example
 * ```tsx
 * <CarouselItemIndicator total={5} activeIndex={2} />
 * ```
 */
const CarouselItemIndicator: FC<CarouselItemIndicatorProps> = ({
  total,
  activeIndex,
  styleIndicatorContainer,
  styleIndicator,
  styleIndicatorActive,
}) => {
  return (
    <StyledView styled={{ style: styleIndicatorContainer }}>
      {Array.from({ length: total }).map((_, index) => (
        <StyledView
          key={index}
          styled={{
            style: [
              styleIndicator,
              index === activeIndex && styleIndicatorActive,
            ],
          }}
        />
      ))}
    </StyledView>
  );
};

export default CarouselItemIndicator;
