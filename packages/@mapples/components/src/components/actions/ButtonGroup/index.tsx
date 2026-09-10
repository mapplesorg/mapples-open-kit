import { forwardRef, PropsWithChildren, useMemo } from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { ButtonGroupContext, ButtonGroupContextValue } from '@mapples/ui';
import { View, ViewProps, ViewStyle } from 'react-native';

import { ButtonGroupDirection } from './types';

/** Props for {@link ButtonGroup}. */
export interface ButtonGroupProps extends ViewProps {
  /** Main axis. Defaults to `row`. */
  direction?: ButtonGroupDirection;
  /** Gives each `Button` in a row the same share of it. Defaults to `true`. */
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
 * A row or column of `Button` children with a shared gap. In a row each
 * button takes an equal share of the width by default ("Cancel" /
 * "Confirm", "Sign in" / "Sign up"); in a column each spans it. The buttons
 * size themselves from the group's context, so no per-button prop is needed.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button label="Cancel" variant="outlined" onPress={close} />
 *   <Button label="Confirm" variant="filled" onPress={confirm} />
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
    const group = useMemo<ButtonGroupContextValue>(
      () => ({ direction, equal, fill: fullWidth }),
      [direction, equal, fullWidth],
    );

    return (
      <ButtonGroupContext.Provider value={group}>
        <StyledView
          ref={ref}
          styled={{
            style: [
              {
                flexDirection: direction,
                alignItems: direction === 'row' ? 'center' : 'stretch',
                alignSelf: fullWidth ? 'stretch' : 'flex-start',
                gap,
              },
              styled?.style,
            ],
          }}
          {...rest}
        >
          {children}
        </StyledView>
      </ButtonGroupContext.Provider>
    );
  },
);
ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
