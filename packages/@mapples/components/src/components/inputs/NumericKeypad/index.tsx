import {
  forwardRef,
  Fragment,
  PropsWithChildren,
  ReactNode,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import {
  DISABLED_OPACITY,
  Icon,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useShape,
  useTones,
} from '@mapples/ui';
import {
  StyleSheet,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { useSlotColor } from '../../../internal';

import { defaults } from './defaults';
import KeypadGlyph from './KeypadGlyph';
import KeypadKey from './KeypadKey';
import {
  NUMERIC_KEYPAD_DIGIT_ROWS,
  NUMERIC_KEYPAD_GEOMETRY,
  NUMERIC_KEYPAD_KEY_SETS,
  NUMERIC_KEYPAD_LEFT_KEYS,
  NumericKeypadKey,
  NumericKeypadKeySet,
  NumericKeypadLeftKey,
  NumericKeypadSize,
  NumericKeypadVariant,
} from './types';

/** Props for {@link NumericKeypad}. */
export interface NumericKeypadProps extends Omit<ViewProps, 'children'> {
  /** `pin`: digits only; `decimal`: adds `.` in the bottom-left cell. Defaults to `pin`. */
  keys?: NumericKeypadKeySet;
  /** Fires with the pressed character key (`'0'`…`'9'` or `'.'`). */
  onKeyPress?: (key: NumericKeypadKey) => void;
  /** Fires when the backspace key is pressed. */
  onBackspace?: () => void;
  /** Shows the backspace key in the bottom-right cell. Defaults to `true`. */
  showBackspace?: boolean;
  /** The bottom-left cell of a `pin` keypad: `biometric` (a fingerprint key) or `none`. Defaults to `none`. */
  leftKey?: NumericKeypadLeftKey;
  /** Fires when the biometric key is pressed. */
  onBiometricPress?: () => void;
  /** Hairline lines between keys and rows (gaps close up). Defaults to `false`. */
  separators?: boolean;
  /** Key size: `sm` 52, `md` 64, `lg` 76 points tall. Defaults to `md`. */
  size?: NumericKeypadSize;
  /** `plain`: flat keys on the surface; `filled`: round tone-tinted digit keys. Defaults to `plain`. */
  variant?: NumericKeypadVariant;
  /** Colour role of the filled keys and the pressed key. Defaults to `neutral`. */
  tone?: Tone;
  /** Disables every key and dims the keypad. */
  disabled?: boolean;
  /** Project icon for the backspace key instead of the built-in glyph. */
  backspaceIconName?: string;
  /** Project icon for the biometric key instead of the built-in fingerprint. */
  biometricIconName?: string;
  /** Spoken name of the backspace key. Defaults to `Delete`. */
  backspaceLabel?: string;
  /** Spoken name of the biometric key. Defaults to `Use biometrics`. */
  biometricLabel?: string;
  /** Spoken name of the `.` key. Defaults to `Decimal point`. */
  decimalLabel?: string;
  /** Styled slots for every visual part. */
  styled?: {
    /** The keypad. */
    style?: StyledProp<ViewStyle>;
    /** Every key. */
    styleKey?: StyledProp<ViewStyle>;
    /** A key while pressed. */
    styleKeyPressed?: StyledProp<ViewStyle>;
    /** The key labels (`color` also paints the backspace and biometric glyphs). */
    styleKeyLabel?: StyledProp<TextStyle>;
    /** The separator lines (`backgroundColor` is their colour). */
    styleSeparator?: StyledProp<ViewStyle>;
  };
}

/** One cell of the bottom row. */
type KeypadCell =
  | { kind: 'char'; key: NumericKeypadKey }
  | { kind: 'backspace' }
  | { kind: 'biometric' }
  | { kind: 'empty' };

/**
 * An on-screen 3×4 number pad for passcodes and amounts — digits 1–9 in
 * three rows, then `.` or a biometric key, `0` and backspace. It reports key
 * presses and keeps no value: the screen owns the code or amount, usually
 * shown by a `PinInput` with `showKeyboard={false}`.
 *
 * @example
 * ```tsx
 * <PinInput variant="dots" showKeyboard={false} value={pin} onComplete={unlock} />
 * <NumericKeypad
 *   leftKey="biometric"
 *   onKeyPress={(key) => setPin((pin) => (pin + key).slice(0, 4))}
 *   onBackspace={() => setPin((pin) => pin.slice(0, -1))}
 *   onBiometricPress={unlockWithBiometrics}
 * />
 * ```
 *
 * @public
 */
const NumericKeypad: ForwardRefExoticComponent<
  PropsWithChildren<NumericKeypadProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<NumericKeypadProps>
>(
  (
    {
      keys = 'pin',
      onKeyPress,
      onBackspace,
      showBackspace = true,
      leftKey = 'none',
      onBiometricPress,
      separators = false,
      size = 'md',
      variant = 'plain',
      tone = 'neutral',
      disabled = false,
      backspaceIconName,
      biometricIconName,
      backspaceLabel = 'Delete',
      biometricLabel = 'Use biometrics',
      decimalLabel = 'Decimal point',
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (!NUMERIC_KEYPAD_KEY_SETS.includes(keys)) {
      throw new Error(
        `NumericKeypad: keys (${String(keys)}) must be one of ${NUMERIC_KEYPAD_KEY_SETS.join(', ')}`,
      );
    }
    if (!NUMERIC_KEYPAD_LEFT_KEYS.includes(leftKey)) {
      throw new Error(
        `NumericKeypad: leftKey (${String(leftKey)}) must be one of ${NUMERIC_KEYPAD_LEFT_KEYS.join(', ')}`,
      );
    }
    if (keys === 'decimal' && leftKey === 'biometric') {
      throw new Error(
        "NumericKeypad: leftKey 'biometric' needs keys 'pin' — the decimal keypad puts '.' in that cell",
      );
    }
    const geometry = NUMERIC_KEYPAD_GEOMETRY[size];
    if (geometry === undefined) {
      throw new Error(
        `NumericKeypad: size (${String(size)}) must be one of ${Object.keys(NUMERIC_KEYPAD_GEOMETRY).join(', ')}`,
      );
    }

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const text = tones.resolve(Tokens.color.text);
    const labelColor = useSlotColor(styled?.styleKeyLabel, 'color', text);
    const separatorColor = useSlotColor(
      styled?.styleSeparator,
      'backgroundColor',
      tones.divider,
    );
    const gap = separators ? 0 : geometry.gap;
    const filled = variant === 'filled';

    const glyph = (
      kind: 'backspace' | 'biometric',
      iconName: string | undefined,
      color: string,
    ): ReactNode =>
      iconName ? (
        <Icon iconName={iconName} size={geometry.glyph} color={color} />
      ) : (
        <KeypadGlyph name={kind} size={geometry.glyph} color={color} />
      );

    const renderCell = (cell: KeypadCell, index: number): ReactNode => {
      if (cell.kind === 'empty') {
        return <StyledView key={index} styled={{ style: defaults.cell }} />;
      }
      const isChar = cell.kind === 'char';
      const round = filled && isChar;
      const common = {
        disabled,
        round,
        size: geometry.key,
        radius: shape.control.md.radius,
        fill: round ? palette.container : 'transparent',
        pressedFill: round
          ? palette.main
          : tones.stateLayer(palette.main, 'pressed'),
        hoverFill: tones.stateLayer(palette.main, 'hover'),
        color: labelColor,
        pressedColor: round ? palette.contrast : labelColor,
        styleKey: styled?.styleKey,
        styleKeyPressed: styled?.styleKeyPressed,
      };
      switch (cell.kind) {
        case 'char':
          return (
            <KeypadKey
              key={index}
              {...common}
              accessibilityLabel={cell.key === '.' ? decimalLabel : cell.key}
              onPress={() => onKeyPress?.(cell.key)}
              renderContent={(color) => (
                <Typography
                  variant={TYPOGRAPHY_PARTS.title}
                  style={[
                    defaults.label,
                    { color, fontSize: geometry.label },
                    styled?.styleKeyLabel,
                    { color },
                  ]}
                >
                  {cell.key}
                </Typography>
              )}
            />
          );
        case 'backspace':
          return (
            <KeypadKey
              key={index}
              {...common}
              accessibilityLabel={backspaceLabel}
              onPress={() => onBackspace?.()}
              renderContent={(color) =>
                glyph('backspace', backspaceIconName, color)
              }
            />
          );
        case 'biometric':
          return (
            <KeypadKey
              key={index}
              {...common}
              accessibilityLabel={biometricLabel}
              onPress={() => onBiometricPress?.()}
              renderContent={(color) =>
                glyph('biometric', biometricIconName, color)
              }
            />
          );
      }
    };

    const bottomRow: KeypadCell[] = [
      keys === 'decimal'
        ? { kind: 'char', key: '.' }
        : leftKey === 'biometric'
          ? { kind: 'biometric' }
          : { kind: 'empty' },
      { kind: 'char', key: '0' },
      showBackspace ? { kind: 'backspace' } : { kind: 'empty' },
    ];
    const rows: KeypadCell[][] = [
      ...NUMERIC_KEYPAD_DIGIT_ROWS.map((row) =>
        row.map((key): KeypadCell => ({ kind: 'char', key })),
      ),
      bottomRow,
    ];

    const separator = (direction: 'row' | 'column', key: string) => (
      <StyledView
        key={key}
        styled={{
          style: [
            direction === 'row'
              ? defaults.separatorRow
              : defaults.separatorColumn,
            direction === 'row'
              ? { height: StyleSheet.hairlineWidth }
              : { width: StyleSheet.hairlineWidth },
            styled?.styleSeparator,
            { backgroundColor: separatorColor },
          ],
        }}
      />
    );

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [
            defaults.root,
            { gap },
            styled?.style,
            disabled && { opacity: DISABLED_OPACITY },
          ],
        }}
        {...rest}
      >
        {rows.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            {separators && rowIndex > 0
              ? separator('row', `separator-${rowIndex}`)
              : null}
            <StyledView styled={{ style: [defaults.row, { gap }] }}>
              {row.map((cell, cellIndex) => (
                <Fragment key={cellIndex}>
                  {separators && cellIndex > 0
                    ? separator('column', `separator-${cellIndex}`)
                    : null}
                  {renderCell(cell, cellIndex)}
                </Fragment>
              ))}
            </StyledView>
          </Fragment>
        ))}
      </StyledView>
    );
  },
);
NumericKeypad.displayName = 'NumericKeypad';

export default NumericKeypad;
