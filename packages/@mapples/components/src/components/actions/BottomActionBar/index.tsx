import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { Tokens, useElevation, useShape, useTones } from '@mapples/ui';
import { View, ViewProps, ViewStyle } from 'react-native';

import { defaults } from './defaults';
import {
  BOTTOM_ACTION_BAR_SAFE_INSET,
  BottomActionBarDirection,
} from './types';

/** Props for {@link BottomActionBar}. */
export interface BottomActionBarProps extends ViewProps {
  /** Pins the bar to the bottom edge of its parent. Defaults to `true`. */
  sticky?: boolean;
  /** Main axis of the actions. Defaults to `row`. */
  direction?: BottomActionBarDirection;
  /** Pads the bottom for the home indicator (34 on iOS, 16 elsewhere). Defaults to `true`. */
  safeArea?: boolean;
  /** Draws a top hairline and a shadow above the bar. Defaults to `true`. */
  elevated?: boolean;
  /** Styled slots. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
  };
}

/**
 * A surface pinned to the bottom of the screen for the primary actions — a
 * price beside "Add to cart", "Continue" under a form. Children (Buttons, a
 * `ButtonGroup`, text) lay out on the chosen axis. `sticky` pins the bar to
 * the parent's bottom edge, so it belongs near the end of the page root with
 * the content padded to clear it.
 *
 * @example
 * ```tsx
 * <BottomActionBar>
 *   <Typography variant="Subtitle">$24.00</Typography>
 *   <Button
 *     label="Add to cart"
 *     variant="filled"
 *     size="lg"
 *     onPress={add}
 *     styled={{ style: { flex: 1 } }}
 *   />
 * </BottomActionBar>
 * ```
 *
 * @public
 */
const BottomActionBar = forwardRef<
  View,
  PropsWithChildren<BottomActionBarProps>
>(
  (
    {
      sticky = true,
      direction = 'row',
      safeArea = true,
      elevated = true,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const shape = useShape();
    // The elevation cast upwards for a bar that sits on the bottom edge.
    const elevation = useElevation('up');

    return (
      <StyledView
        ref={ref}
        accessibilityRole="toolbar"
        styled={{
          style: [
            defaults.root,
            {
              flexDirection: direction,
              alignItems: direction === 'row' ? 'center' : 'stretch',
              backgroundColor: tones.resolve(Tokens.color.surface),
            },
            sticky ? defaults.sticky : { alignSelf: 'stretch' },
            safeArea && { paddingBottom: BOTTOM_ACTION_BAR_SAFE_INSET },
            elevated && {
              borderTopWidth: shape.borderWidth(1),
              borderTopColor: tones.divider,
              boxShadow: elevation,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {children}
      </StyledView>
    );
  },
);
BottomActionBar.displayName = 'BottomActionBar';

export default BottomActionBar;
