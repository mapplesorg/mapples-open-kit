import { FC } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { ViewStyle } from 'react-native';

interface CarouselItemIndicatorProps {
  total: number;
  activeIndex: number;
  styleIndicatorContainer?: StyledProp<ViewStyle>;
  styleIndicator?: StyledProp<ViewStyle>;
  styleIndicatorActive?: StyledProp<ViewStyle>;
}

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
