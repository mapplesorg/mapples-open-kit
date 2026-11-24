import { Children, isValidElement, ReactNode } from 'react';

import { View, ViewStyle } from 'react-native';

import { ScrollEffect, scrollEffectItem } from './scrollEffect';

/** Props for {@link ScrollEffectItems}. */
export interface ScrollEffectItemsProps {
  effect: ScrollEffect;
  /** Where the scroll view stands along its axis. */
  offset: number;
  horizontal: boolean;
  children?: ReactNode;
}

/**
 * The children of a scroll view with a {@link ScrollEffect}, on native: each
 * child in a view one `itemSize` long that carries the item's transform and
 * opacity for the current offset. (The web styles the items in the DOM, see
 * `useWebScrollEffect`.)
 */
const ScrollEffectItems = ({
  effect,
  offset,
  horizontal,
  children,
}: ScrollEffectItemsProps) => (
  <>
    {Children.toArray(children).map((child, index) => {
      const item = scrollEffectItem(effect, index, offset);
      const style: ViewStyle = {
        [horizontal ? 'width' : 'height']: effect.itemSize,
        opacity: item.opacity,
        zIndex: item.zIndex,
        transformOrigin: effect.origin,
        transform: [
          { perspective: item.perspective },
          horizontal
            ? { translateY: item.translate }
            : { translateX: item.translate },
          horizontal
            ? { rotateY: `${item.rotate}deg` }
            : { rotateX: `${item.rotate}deg` },
          { scale: item.scale },
        ],
      };
      return (
        <View
          key={isValidElement(child) ? (child.key ?? index) : index}
          style={style}
        >
          {child}
        </View>
      );
    })}
  </>
);

export default ScrollEffectItems;
