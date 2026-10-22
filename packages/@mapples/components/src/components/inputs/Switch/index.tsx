import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography, useStyled } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import {
  DURATION,
  useControllableState,
  useOptionalFormField,
  useSlotColor,
  useSlotSize,
  useTimingValue,
} from '../../../internal';

import { defaults } from './defaults';
import {
  SWITCH_GEOMETRY,
  SWITCH_THUMB_SHADOW,
  SwitchLabelPosition,
  SwitchShape,
  SwitchSize,
} from './types';

/** Props for {@link Switch}. */
export interface SwitchProps extends Omit<ViewProps, 'children'> {
  /** On/off state (controlled). Omit to let the switch keep its own state. */
  value?: boolean;
  /** Initial state while uncontrolled. Defaults to `false`. */
  defaultValue?: boolean;
  /** Fires with the next state — the new value is the first argument. */
  onValueChange?: (value: boolean) => void;
  /** Text beside the track. */
  label?: string;
  /** Supporting text under the label. */
  description?: string;
  /** Which side the label sits on. Defaults to `left`. */
  labelPosition?: SwitchLabelPosition;
  /** Track size. Defaults to `md`. */
  size?: SwitchSize;
  /** Full-round track and thumb (`round`) or rounded squares from the project shape (`rounded`). Defaults to `round`. */
  shape?: SwitchShape;
  /** Draws the thumb's drop shadow. Defaults to `true`. */
  thumbShadow?: boolean;
  /** Colour role of the on state. Defaults to `primary`. */
  tone?: Tone;
  /** Disables interaction and dims the control. */
  disabled?: boolean;
  /** Binds the state to a field of the enclosing `FormView`. */
  fieldName?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row holding label and track. */
    style?: StyledProp<ViewStyle>;
    /** The track (off state); its `borderRadius` wins over `shape`. */
    styleTrack?: StyledProp<ViewStyle>;
    /** The track's on-state layer (its `backgroundColor` is the on colour). */
    styleTrackOn?: StyledProp<ViewStyle>;
    /** The thumb (its `backgroundColor` is the off-state thumb colour; its `borderRadius` wins over `shape`). */
    styleThumb?: StyledProp<ViewStyle>;
    /** The thumb's on-state layer (its `backgroundColor` is the on-state thumb colour). */
    styleThumbOn?: StyledProp<ViewStyle>;
    /** The label text. */
    styleLabel?: StyledProp<TextStyle>;
    /** The description text. */
    styleDescription?: StyledProp<TextStyle>;
  };
}

/**
 * A labelled on/off toggle for settings that apply immediately.
 *
 * The track cross-fades to the tone colour and the thumb slides (and
 * cross-fades to its on colour when `styleThumbOn` sets one); the state
 * is controlled through `value`/`onValueChange`, kept internally when
 * `value` is omitted, or bound to a form field through `fieldName`.
 *
 * @example
 * ```tsx
 * <Switch label="Notifications" value={enabled} onValueChange={setEnabled} />
 * ```
 *
 * @public
 */
const Switch: ForwardRefExoticComponent<
  PropsWithChildren<SwitchProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<SwitchProps>>(
  (
    {
      value,
      defaultValue = false,
      onValueChange,
      label,
      description,
      labelPosition = 'left',
      size = 'md',
      shape = 'round',
      thumbShadow = true,
      tone = 'primary',
      disabled = false,
      fieldName,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const tones = useTones();
    const projectShape = useShape();
    const palette = tones.tone(tone);
    const field = useOptionalFormField<boolean>(fieldName);

    const [checked, setChecked] = useControllableState<boolean>({
      value: field.bound ? (field.value ?? false) : value,
      defaultValue,
      onChange: (next) => {
        field.setValue(next);
        onValueChange?.(next);
      },
    });

    const geometry = SWITCH_GEOMETRY[size];
    const progress = useTimingValue(checked ? 1 : 0, {
      duration: DURATION.fast,
    });
    const trackOff = useSlotColor(
      styled?.styleTrack,
      'backgroundColor',
      tones.outlineStrong,
    );
    const trackOn = useSlotColor(
      styled?.styleTrackOn,
      'backgroundColor',
      palette.main,
    );
    const thumb = useSlotColor(
      styled?.styleThumb,
      'backgroundColor',
      tones.resolve(Tokens.color.white),
    );
    const thumbOn = useSlotColor(
      styled?.styleThumbOn,
      'backgroundColor',
      thumb,
    );
    const resolved = useStyled({
      trackOn: styled?.styleTrackOn,
      thumb: styled?.styleThumb,
      thumbOn: styled?.styleThumbOn,
    }) as { trackOn?: ViewStyle; thumb?: ViewStyle; thumbOn?: ViewStyle };

    const rounded = shape === 'rounded';
    const trackRadius = useSlotSize(
      styled?.styleTrack,
      'borderRadius',
      rounded
        ? Math.min(projectShape.radius.sm, geometry.height / 2)
        : geometry.height / 2,
    );
    const thumbRadius = useSlotSize(
      styled?.styleThumb,
      'borderRadius',
      rounded
        ? Math.max(0, trackRadius - geometry.padding)
        : geometry.thumb / 2,
    );

    const travel = geometry.width - geometry.thumb - geometry.padding * 2;
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, travel],
    });

    const labels = label ? (
      <StyledView styled={{ style: defaults.labels }}>
        <Typography
          variant={TYPOGRAPHY_PARTS.body}
          style={[
            { color: tones.resolve(Tokens.color.text) },
            styled?.styleLabel,
          ]}
        >
          {label}
        </Typography>
        {description ? (
          <Typography
            variant={TYPOGRAPHY_PARTS.helper}
            style={[
              { color: tones.resolve(Tokens.color.textSecondary) },
              styled?.styleDescription,
            ]}
          >
            {description}
          </Typography>
        ) : null}
      </StyledView>
    ) : null;

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {labelPosition === 'left' ? labels : null}
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityState={{ checked, disabled }}
          disabled={disabled}
          hitSlop={8}
          onPress={() => setChecked(!checked)}
        >
          <StyledView
            styled={{
              style: [
                defaults.track,
                {
                  width: geometry.width,
                  height: geometry.height,
                  borderRadius: trackRadius,
                  backgroundColor: trackOff,
                },
                styled?.styleTrack,
              ],
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: trackRadius },
                resolved.trackOn,
                { backgroundColor: trackOn, opacity: progress },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                { borderRadius: thumbRadius },
                thumbShadow && { boxShadow: SWITCH_THUMB_SHADOW },
                // After the corners and shadow, so the slot wins over them;
                // geometry, colour and motion stay the switch's own.
                resolved.thumb,
                {
                  position: 'absolute',
                  top: geometry.padding,
                  left: geometry.padding,
                  width: geometry.thumb,
                  height: geometry.thumb,
                  backgroundColor: thumb,
                  transform: [{ translateX }],
                },
              ]}
            >
              {thumbOn !== thumb ? (
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    { borderRadius: thumbRadius },
                    resolved.thumbOn,
                    { backgroundColor: thumbOn, opacity: progress },
                  ]}
                />
              ) : null}
            </Animated.View>
          </StyledView>
        </Pressable>
        {labelPosition === 'right' ? labels : null}
      </StyledView>
    );
  },
);
Switch.displayName = 'Switch';

export default Switch;
