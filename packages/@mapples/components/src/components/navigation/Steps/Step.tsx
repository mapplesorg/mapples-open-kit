import { FC } from 'react';

import {
  StyledPressable,
  StyledProp,
  StyledView,
  Typography,
} from '@mapples/style';
import { TYPOGRAPHY_PARTS } from '@mapples/ui';
import { TextStyle, ViewStyle } from 'react-native';

import { Glyph } from '../../../internal';

import { defaults } from './defaults';
import {
  STEPS_CONNECTOR_THICKNESS,
  STEPS_GEOMETRY,
  StepItem,
  StepsOrientation,
  StepsVariant,
  StepStatus,
} from './types';

/** Resolved colours one step paints with. */
export interface StepColors {
  /** The tone's main colour (done fills, current outline and label). */
  main: string;
  /** Text/glyph colour on a `main` fill. */
  contrast: string;
  /** Upcoming outlines and pending connectors. */
  pending: string;
  /** Done/upcoming label colour. */
  text: string;
  /** Description and upcoming label colour. */
  textSecondary: string;
}

/** The author slots a step accepts. */
export interface StepSlots {
  styleStep?: StyledProp<ViewStyle>;
  styleIndicator?: StyledProp<ViewStyle>;
  styleIndicatorActive?: StyledProp<ViewStyle>;
  styleIndicatorDone?: StyledProp<ViewStyle>;
  styleLabel?: StyledProp<TextStyle>;
  styleLabelActive?: StyledProp<TextStyle>;
  styleDescription?: StyledProp<TextStyle>;
  styleConnector?: StyledProp<ViewStyle>;
  styleConnectorDone?: StyledProp<ViewStyle>;
}

export interface StepProps {
  item: StepItem;
  index: number;
  status: StepStatus;
  /** Whether the connector before this step is done (the previous step is). */
  connectorBeforeDone: boolean;
  /** Whether the connector after this step is done (this step is). */
  connectorAfterDone: boolean;
  first: boolean;
  last: boolean;
  orientation: StepsOrientation;
  variant: StepsVariant;
  colors: StepColors;
  slots: StepSlots;
  onPress?: (index: number) => void;
}

/**
 * One step of a `Steps` indicator: the indicator with its connectors, the
 * label and the description, laid out as a centred column (horizontal) or a
 * rail-and-text row (vertical).
 */
const Step: FC<StepProps> = ({
  item,
  index,
  status,
  connectorBeforeDone,
  connectorAfterDone,
  first,
  last,
  orientation,
  variant,
  colors,
  slots,
  onPress,
}) => {
  const geometry = STEPS_GEOMETRY[variant];
  const done = status === 'done';
  const current = status === 'current';
  const horizontal = orientation === 'horizontal';

  const indicatorBackground = done
    ? colors.main
    : variant === 'dot' && !current
      ? colors.pending
      : 'transparent';
  const indicatorBorder = done || current ? colors.main : colors.pending;
  const indicatorContent = done
    ? colors.contrast
    : current
      ? colors.main
      : colors.textSecondary;
  const labelColor = current
    ? colors.main
    : done
      ? colors.text
      : colors.textSecondary;

  const connector = (isDone: boolean, visible: boolean) => (
    <StyledView
      pointerEvents="none"
      styled={{
        style: [
          horizontal
            ? defaults.connectorHorizontal
            : defaults.connectorVertical,
          horizontal
            ? { height: STEPS_CONNECTOR_THICKNESS }
            : { width: STEPS_CONNECTOR_THICKNESS },
          {
            backgroundColor: visible
              ? isDone
                ? colors.main
                : colors.pending
              : 'transparent',
          },
          visible && slots.styleConnector,
          visible && isDone && slots.styleConnectorDone,
        ],
      }}
    />
  );

  const indicator = (
    <StyledView
      styled={{
        style: [
          defaults.indicator,
          {
            width: geometry.indicator,
            height: geometry.indicator,
            borderRadius: geometry.indicator / 2,
            borderWidth: geometry.border,
            borderColor: indicatorBorder,
            backgroundColor: indicatorBackground,
          },
          slots.styleIndicator,
          current && slots.styleIndicatorActive,
          done && slots.styleIndicatorDone,
        ],
      }}
    >
      {variant === 'dot' ? null : variant === 'icon' && done ? (
        <Glyph name="check" size={geometry.glyph} color={indicatorContent} />
      ) : (
        <Typography
          variant={TYPOGRAPHY_PARTS.label}
          style={[defaults.number, { color: indicatorContent }]}
        >
          {String(index + 1)}
        </Typography>
      )}
    </StyledView>
  );

  const texts = (
    <StyledView
      styled={{
        style: [
          horizontal ? defaults.textsHorizontal : defaults.textsVertical,
          !horizontal && !last && { paddingBottom: 20 },
        ],
      }}
    >
      <Typography
        variant={TYPOGRAPHY_PARTS.label}
        numberOfLines={horizontal ? 2 : undefined}
        style={[
          horizontal && defaults.centred,
          { color: labelColor },
          slots.styleLabel,
          current && slots.styleLabelActive,
        ]}
      >
        {item.label}
      </Typography>
      {item.description ? (
        <Typography
          variant={TYPOGRAPHY_PARTS.helper}
          numberOfLines={horizontal ? 2 : undefined}
          style={[
            horizontal && defaults.centred,
            { color: colors.textSecondary },
            slots.styleDescription,
          ]}
        >
          {item.description}
        </Typography>
      ) : null}
    </StyledView>
  );

  const Root = onPress ? StyledPressable : StyledView;

  return (
    <Root
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={item.label}
      accessibilityState={{ selected: current }}
      onPress={onPress ? () => onPress(index) : undefined}
      styled={{
        style: [
          horizontal ? defaults.stepHorizontal : defaults.stepVertical,
          slots.styleStep,
        ],
      }}
    >
      {horizontal ? (
        <>
          <StyledView styled={{ style: defaults.indicatorRow }}>
            {connector(connectorBeforeDone, !first)}
            {indicator}
            {connector(connectorAfterDone, !last)}
          </StyledView>
          {texts}
        </>
      ) : (
        <>
          <StyledView
            styled={{ style: [defaults.rail, { width: geometry.indicator }] }}
          >
            {indicator}
            {last ? null : connector(connectorAfterDone, true)}
          </StyledView>
          {texts}
        </>
      )}
    </Root>
  );
};

export default Step;
