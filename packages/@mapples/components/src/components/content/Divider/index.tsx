import { forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useSlotColor } from '../../../internal';

import { DividerOrientation } from './types';

/** Props for {@link Divider}. */
export interface DividerProps extends Omit<ViewProps, 'children'> {
  /** Direction. Defaults to `horizontal`. */
  orientation?: DividerOrientation;
  /** Start inset in points (a list divider aligned with its text). Defaults to `0`. */
  inset?: number;
  /** Centred text ("or"). */
  label?: string;
  /** Line thickness in points. Defaults to `1`. */
  thickness?: number;
  /** Styled slots for every visual part. */
  styled?: {
    /** The divider row/column. */
    style?: StyledProp<ViewStyle>;
    /** The line (its `backgroundColor` is the colour). */
    styleLine?: StyledProp<ViewStyle>;
    /** The label. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * A hairline separator, horizontal by default, with an optional inset and a
 * centred label. The colour derives from the text colour so it reads on light
 * and dark surfaces alike.
 *
 * @example
 * ```tsx
 * <Divider label="or" />
 * ```
 *
 * @public
 */
const Divider = forwardRef<View, PropsWithChildren<DividerProps>>(
  (
    {
      orientation = 'horizontal',
      inset = 0,
      label,
      thickness = 1,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const color = useSlotColor(
      styled?.styleLine,
      'backgroundColor',
      tones.divider,
    );
    const vertical = orientation === 'vertical';

    const line = (
      <StyledView
        styled={{
          style: [
            vertical
              ? { width: thickness, alignSelf: 'stretch' }
              : { height: thickness, flex: 1 },
            { backgroundColor: color },
            styled?.styleLine,
          ],
        }}
      />
    );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="none"
        styled={{
          style: [
            vertical
              ? {
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                  marginTop: inset,
                }
              : {
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'stretch',
                  marginStart: inset,
                  gap: 12,
                },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {line}
        {label && !vertical ? (
          <>
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              style={[
                { color: tones.resolve(Tokens.color.textSecondary) },
                styled?.styleLabel,
              ]}
            >
              {label}
            </Typography>
            {line}
          </>
        ) : null}
      </StyledView>
    );
  },
);
Divider.displayName = 'Divider';

export default Divider;
