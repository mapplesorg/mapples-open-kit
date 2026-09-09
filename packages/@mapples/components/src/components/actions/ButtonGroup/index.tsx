import { Children, forwardRef, PropsWithChildren } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { View, ViewProps, ViewStyle } from 'react-native';

import { ButtonGroupDirection } from './types';

/** Props for {@link ButtonGroup}. */
export interface ButtonGroupProps extends ViewProps {
  /** Main axis. Defaults to `row`. */
  direction?: ButtonGroupDirection;
  /** Gives each of two or more children the same share of the group; a child fills its share with `fullWidth`. Defaults to `true`. */
  equal?: boolean;
  /** Space between children in points. Defaults to `8`. */
  gap?: number;
  /** Spans the parent's width. Defaults to `true`. */
  fullWidth?: boolean;
  /** Styled slots. */
  styled?: {
    /** The group. */
    style?: StyledProp<ViewStyle>;
  };
}

/**
 * A row or column of `Button` children with a shared gap and, by default,
 * equal shares of the width ("Cancel" / "Confirm", "Sign in" / "Sign up").
 * Buttons inside set `fullWidth` to fill their share.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button label="Cancel" variant="outlined" fullWidth onPress={close} />
 *   <Button label="Confirm" variant="filled" fullWidth onPress={confirm} />
 * </ButtonGroup>
 * ```
 *
 * @public
 */
const ButtonGroup = forwardRef<View, PropsWithChildren<ButtonGroupProps>>(
  (
    {
      direction = 'row',
      equal = true,
      gap = 8,
      fullWidth = true,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    const row = direction === 'row';
    // Every child sits in its own cell that mirrors the group's axis: on
    // device each Button gets an equal share; on the canvas the single
    // drop-area child still lays its elements out along the same axis.
    const cell: ViewStyle = row
      ? {
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: fullWidth ? 0 : 'auto',
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap,
        }
      : { alignSelf: 'stretch', flexDirection: 'column', gap };

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            {
              flexDirection: direction,
              alignItems: row ? 'center' : 'stretch',
              alignSelf: fullWidth ? 'stretch' : 'flex-start',
              gap,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {equal
          ? Children.map(children, (child) =>
              child === null ||
              child === undefined ||
              typeof child === 'boolean' ? null : (
                <StyledView styled={{ style: cell }}>{child}</StyledView>
              ),
            )
          : children}
      </StyledView>
    );
  },
);
ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
