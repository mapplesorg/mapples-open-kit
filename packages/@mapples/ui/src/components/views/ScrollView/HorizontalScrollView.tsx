import { forwardRef } from 'react';

import ScrollView, { ScrollViewProps } from './ScrollView';

/**
 * A ScrollView that scrolls along the horizontal axis.
 *
 * Use it for a rail of chips, cards or thumbnails wider than the screen. It
 * takes every ScrollView prop; `horizontal` defaults to `true`.
 *
 * @example
 * ```tsx
 * <HorizontalScrollView
 *   styled={{
 *     contentContainerStyle: { gap: 12, paddingHorizontal: 20 },
 *   }}
 * >
 *   <Text text="First card" />
 *   <Text text="Second card" />
 * </HorizontalScrollView>
 * ```
 *
 * @public
 */
const HorizontalScrollView = forwardRef((props: ScrollViewProps, ref) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={ref}
      {...props}
    />
  );
});
HorizontalScrollView.displayName = 'HorizontalScrollView';

export default HorizontalScrollView;
