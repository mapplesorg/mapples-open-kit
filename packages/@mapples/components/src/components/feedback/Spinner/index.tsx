import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import {
  ActivityIndicator,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { defaults } from './defaults';
import { SPINNER_GEOMETRY, SpinnerSize, SpinnerTone } from './types';

/** Props for {@link Spinner}. */
export interface SpinnerProps extends Omit<ViewProps, 'children'> {
  /** Indicator size. Defaults to `md`. */
  size?: SpinnerSize;
  /** Colour role: the primary colour, secondary text, or the contrast colour on a primary fill. Defaults to `primary`. */
  tone?: SpinnerTone;
  /** Caption under the indicator ('Loading…'). */
  label?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The column holding indicator and label. */
    style?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
  };
}

/**
 * The platform activity indicator in a theme colour, with an optional
 * caption — for short waits inside a screen or a button. Long or measurable
 * work belongs to `ProgressBar`/`ProgressCircle`.
 *
 * @example
 * ```tsx
 * <Spinner label="Loading…" />
 * <Spinner size="sm" tone="onPrimary" />
 * ```
 *
 * @public
 */
const Spinner: ForwardRefExoticComponent<
  PropsWithChildren<SpinnerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<SpinnerProps>>(
  (
    {
      size = 'md',
      tone = 'primary',
      label,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const geometry = SPINNER_GEOMETRY[size];
    const primary = tones.tone('primary');
    const color =
      tone === 'primary'
        ? primary.main
        : tone === 'neutral'
          ? tones.resolve(Tokens.color.textSecondary)
          : primary.contrast;
    const labelColor =
      tone === 'onPrimary'
        ? primary.contrast
        : tones.resolve(Tokens.color.textSecondary);

    return (
      <StyledView
        ref={ref}
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        accessibilityLabel={label}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        <StyledView
          styled={{
            style: [
              defaults.box,
              { width: geometry.box, height: geometry.box },
            ],
          }}
        >
          <ActivityIndicator size={geometry.indicator} color={color} />
        </StyledView>
        {label ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            style={[defaults.label, { color: labelColor }, styled?.styleLabel]}
          >
            {label}
          </Typography>
        ) : null}
      </StyledView>
    );
  },
);
Spinner.displayName = 'Spinner';

export default Spinner;
