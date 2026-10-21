import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView } from '@mapples/style';
import { Tokens, Tone, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { defaults } from './defaults';
import Step, { StepColors } from './Step';
import {
  readStepItems,
  StepItem,
  StepsOrientation,
  StepStatus,
  StepsVariant,
} from './types';

/** Props for {@link Steps}. */
export interface StepsProps extends Omit<ViewProps, 'children'> {
  /** The steps in order. */
  items?: StepItem[];
  /** Index of the current step; earlier steps are done. Defaults to `0`. */
  current?: number;
  /** Layout direction. Defaults to `horizontal`. */
  orientation?: StepsOrientation;
  /** Indicator style. Defaults to `numbered`. */
  variant?: StepsVariant;
  /** Makes every step pressable, firing `onStepPress`. */
  clickable?: boolean;
  /** Fires with the pressed step's index (with `clickable`). */
  onStepPress?: (index: number) => void;
  /** Colour role of done and current indicators. Defaults to `primary`. */
  tone?: Tone;
  /** Styled slots for every visual part. */
  styled?: {
    /** The whole indicator. */
    style?: StyledProp<ViewStyle>;
    /** One step (indicator, connectors and texts). */
    styleStep?: StyledProp<ViewStyle>;
    /** Every indicator circle. */
    styleIndicator?: StyledProp<ViewStyle>;
    /** The current step's indicator. */
    styleIndicatorActive?: StyledProp<ViewStyle>;
    /** A done step's indicator. */
    styleIndicatorDone?: StyledProp<ViewStyle>;
    /** Every label. */
    styleLabel?: StyledProp<TextStyle>;
    /** The current step's label. */
    styleLabelActive?: StyledProp<TextStyle>;
    /** The descriptions. */
    styleDescription?: StyledProp<TextStyle>;
    /** Every connector line. */
    styleConnector?: StyledProp<ViewStyle>;
    /** A connector after a done step. */
    styleConnectorDone?: StyledProp<ViewStyle>;
  };
}

/**
 * A step indicator for checkout, onboarding and wizard flows — numbered,
 * dotted, or with a check on done steps — laid out as equal columns or a
 * vertical rail. `current` marks the active step; everything before it is
 * done.
 *
 * @example
 * ```tsx
 * <Steps
 *   items={[{ label: 'Cart' }, { label: 'Address' }, { label: 'Payment' }]}
 *   current={1}
 *   variant="icon"
 * />
 * ```
 *
 * @public
 */
const Steps: ForwardRefExoticComponent<
  PropsWithChildren<StepsProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<StepsProps>>(
  (
    {
      items,
      current = 0,
      orientation = 'horizontal',
      variant = 'numbered',
      clickable = false,
      onStepPress,
      tone = 'primary',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const palette = tones.tone(tone);
    const steps = readStepItems(items);

    const colors: StepColors = {
      main: palette.main,
      contrast: palette.contrast,
      pending: tones.outlineStrong,
      text: tones.resolve(Tokens.color.text),
      textSecondary: tones.resolve(Tokens.color.textSecondary),
    };

    const statusOf = (index: number): StepStatus =>
      index < current ? 'done' : index === current ? 'current' : 'upcoming';

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            orientation === 'horizontal'
              ? defaults.horizontal
              : defaults.vertical,
            styled?.style,
          ],
        }}
        {...rest}
      >
        {steps.map((item, index) => (
          <Step
            key={index}
            item={item}
            index={index}
            status={statusOf(index)}
            connectorBeforeDone={index <= current}
            connectorAfterDone={index < current}
            first={index === 0}
            last={index === steps.length - 1}
            orientation={orientation}
            variant={variant}
            colors={colors}
            slots={{
              styleStep: styled?.styleStep,
              styleIndicator: styled?.styleIndicator,
              styleIndicatorActive: styled?.styleIndicatorActive,
              styleIndicatorDone: styled?.styleIndicatorDone,
              styleLabel: styled?.styleLabel,
              styleLabelActive: styled?.styleLabelActive,
              styleDescription: styled?.styleDescription,
              styleConnector: styled?.styleConnector,
              styleConnectorDone: styled?.styleConnectorDone,
            }}
            onPress={clickable ? (step) => onStepPress?.(step) : undefined}
          />
        ))}
      </StyledView>
    );
  },
);
Steps.displayName = 'Steps';

export default Steps;
