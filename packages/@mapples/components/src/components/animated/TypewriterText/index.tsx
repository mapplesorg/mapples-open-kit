import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Typography } from '@mapples/style';
import { Tokens, TYPOGRAPHY_PARTS, useTones } from '@mapples/ui';
import { Text, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useReduceMotion } from '../../../internal';

import {
  TYPEWRITER_CURSOR,
  TYPEWRITER_CURSOR_BLINK,
  TYPEWRITER_LOOP_PAUSE,
  TYPEWRITER_SPEED,
} from './types';

/** Props for {@link TypewriterText}. */
export interface TypewriterTextProps extends Omit<ViewProps, 'children'> {
  /** The text to type. */
  text?: string;
  /** Characters per second. Defaults to `30`. */
  speed?: number;
  /** Wait before the first character, in ms. Defaults to `0`. */
  startDelay?: number;
  /** Shows a blinking cursor after the typed text. Defaults to `true`. */
  cursor?: boolean;
  /** Types the text again after a pause, forever. Defaults to `false`. */
  loop?: boolean;
  /** Typography variant of the text. Defaults to the body variant. */
  typographyVariant?: string;
  /** Fires once the whole text is typed (each time, with `loop`). */
  onComplete?: () => void;
  /** Styled slots. */
  styled?: {
    /** The box around the text. */
    style?: StyledProp<ViewStyle>;
    /** The text (the cursor takes its colour). */
    styleText?: StyledProp<TextStyle>;
  };
}

/**
 * Text that types itself out, one character at a time — an assistant's
 * answer, an onboarding line, a hero tagline. It types again whenever `text`
 * changes. The box is as tall as the whole text from the start, so nothing
 * below it moves while it types. Screen readers get the whole text at once.
 * With reduced motion the text is simply shown.
 *
 * @example
 * ```tsx
 * <TypewriterText text="What should we build today?" speed={40} />
 * ```
 *
 * @public
 */
const TypewriterText: ForwardRefExoticComponent<
  PropsWithChildren<TypewriterTextProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<TypewriterTextProps>
>(
  (
    {
      text = '',
      speed = TYPEWRITER_SPEED,
      startDelay = 0,
      cursor = true,
      loop = false,
      typographyVariant,
      onComplete,
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (typeof text !== 'string') {
      throw new Error('TypewriterText: text must be a string');
    }
    if (!(speed > 0)) {
      throw new Error(`TypewriterText: speed (${speed}) must be positive`);
    }
    if (!(startDelay >= 0)) {
      throw new Error(
        `TypewriterText: startDelay (${startDelay}) must be at least 0`,
      );
    }

    const tones = useTones();
    const reduceMotion = useReduceMotion();
    // Characters, not UTF-16 units: an emoji is typed whole.
    const characters = Array.from(text);
    const total = characters.length;
    const [typed, setTyped] = useState(0);
    const [cursorOn, setCursorOn] = useState(true);
    // A run is keyed by the text: a new text starts from the first character.
    const [run, setRun] = useState({ text, round: 0 });
    if (run.text !== text) {
      setRun({ text, round: 0 });
      setTyped(0);
    }

    const done = reduceMotion || typed >= total;

    useEffect(() => {
      if (reduceMotion || total === 0) return undefined;

      let interval: ReturnType<typeof setInterval> | undefined;
      const start = setTimeout(() => {
        interval = setInterval(() => {
          setTyped((count) => {
            if (count + 1 >= total && interval) clearInterval(interval);
            return Math.min(total, count + 1);
          });
        }, 1000 / speed);
      }, startDelay);

      return () => {
        clearTimeout(start);
        if (interval) clearInterval(interval);
      };
      // `run` restarts the typing for a new text and for each loop round.
    }, [reduceMotion, run, speed, startDelay, total]);

    useEffect(() => {
      if (reduceMotion || total === 0 || typed < total) return undefined;

      onComplete?.();
      if (!loop) return undefined;

      const again = setTimeout(() => {
        setTyped(0);
        setRun((current) => ({ ...current, round: current.round + 1 }));
      }, TYPEWRITER_LOOP_PAUSE);
      return () => clearTimeout(again);
      // Reports the end of a run once, not each time the handler changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loop, reduceMotion, total, typed]);

    const showCursor = cursor && !reduceMotion && (loop || !done);
    useEffect(() => {
      if (!showCursor) return undefined;

      const blink = setInterval(
        () => setCursorOn((on) => !on),
        TYPEWRITER_CURSOR_BLINK,
      );
      return () => clearInterval(blink);
    }, [showCursor]);

    const color = tones.resolve(Tokens.color.text);
    const visible = done ? text : characters.slice(0, typed).join('');
    const pending = done ? '' : characters.slice(typed).join('');

    return (
      <StyledView
        ref={ref}
        accessible
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? text}
        styled={{ style: styled?.style }}
        {...rest}
      >
        <Typography
          variant={typographyVariant ?? TYPOGRAPHY_PARTS.body}
          style={[{ color }, styled?.styleText]}
        >
          {visible}
          {showCursor ? (
            <Text style={{ opacity: cursorOn ? 1 : 0 }}>
              {TYPEWRITER_CURSOR}
            </Text>
          ) : null}
          {/* The part still to come, laid out but unseen: the box has its
              final size from the first frame. */}
          {pending ? <Text style={{ opacity: 0 }}>{pending}</Text> : null}
        </Typography>
      </StyledView>
    );
  },
);
TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;
