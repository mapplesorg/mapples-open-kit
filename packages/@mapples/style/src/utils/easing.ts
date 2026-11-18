import { cubicBezier, steps } from 'react-native-reanimated';

import { MotionEasings } from '../types';

/** The timing functions Reanimated's CSS layer knows by name. */
export const NAMED_TIMING_FUNCTIONS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'step-start',
  'step-end',
] as const;

/** How a style refers to one of the project's easing tokens: `easing.spring`. */
export const EASING_TOKEN_PREFIX = 'easing.';

const STEPS_MODIFIERS = [
  'jump-start',
  'start',
  'jump-end',
  'end',
  'jump-none',
  'jump-both',
] as const;

type StepsModifier = (typeof STEPS_MODIFIERS)[number];

const CUBIC_BEZIER = /^cubic-bezier\(([^)]*)\)$/;
const STEPS = /^steps\(\s*(\d+)\s*(?:,\s*([a-z-]+)\s*)?\)$/;

/**
 * The four control values of a `cubic-bezier(x1, y1, x2, y2)` string, or
 * `undefined` when the text is not one. `x1` and `x2` must lie between 0 and
 * 1 (time cannot run backwards); `y1` and `y2` may overshoot, which is what
 * makes a curve spring past its end.
 */
export const parseCubicBezier = (
  value: string,
): [number, number, number, number] | undefined => {
  const match = CUBIC_BEZIER.exec(value.trim());
  if (!match) return undefined;

  const parts = match[1].split(',').map((part) => part.trim());
  if (parts.length !== 4 || parts.some((part) => part === '')) return undefined;

  const numbers = parts.map(Number);
  if (numbers.some((part) => !Number.isFinite(part))) return undefined;

  const [x1, y1, x2, y2] = numbers;
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return undefined;

  return [x1, y1, x2, y2];
};

/** Whether the text is a timing function project data can hold. */
export const isTimingFunctionText = (value: string): boolean => {
  const text = value.trim();
  return (
    (NAMED_TIMING_FUNCTIONS as readonly string[]).includes(text) ||
    parseCubicBezier(text) !== undefined ||
    STEPS.test(text)
  );
};

const describe = (easings: MotionEasings | undefined) => {
  const tokens = Object.keys(easings ?? {});
  return (
    `Use ${NAMED_TIMING_FUNCTIONS.join(', ')}, cubic-bezier(x1, y1, x2, y2) ` +
    `with x1 and x2 between 0 and 1, steps(n)` +
    (tokens.length
      ? ` or a project easing: ${tokens.map((key) => EASING_TOKEN_PREFIX + key).join(', ')}`
      : '')
  );
};

/**
 * One timing function as Reanimated takes it. Project data holds text: a
 * name (`ease-out`), a curve (`cubic-bezier(.3, 1.4, .5, 1)`), `steps(4)`,
 * or a reference to one of the project's easing tokens (`easing.spring`).
 * A curve becomes Reanimated's `cubicBezier(...)`, because its native CSS
 * layer does not read the text form. A value that is not text (an easing
 * already built in code) passes through. Anything else is a mistake in the
 * project data, so it throws.
 *
 * @param value - The timing function a style or a keyframe names
 * @param easings - The project's easing tokens
 */
export const resolveTimingFunction = (
  value: unknown,
  easings?: MotionEasings,
): unknown => {
  if (typeof value !== 'string') return value;

  const text = value.trim();

  if (text.startsWith(EASING_TOKEN_PREFIX)) {
    const key = text.slice(EASING_TOKEN_PREFIX.length);
    const token = easings?.[key];
    if (typeof token !== 'string') {
      throw new Error(`Unknown easing token "${text}". ${describe(easings)}`);
    }
    if (token.trim().startsWith(EASING_TOKEN_PREFIX)) {
      throw new Error(
        `Easing token "${text}" refers to another token ("${token}"); it must hold a curve`,
      );
    }
    return resolveTimingFunction(token, easings);
  }

  if ((NAMED_TIMING_FUNCTIONS as readonly string[]).includes(text)) return text;

  const bezier = parseCubicBezier(text);
  if (bezier) return cubicBezier(...bezier);

  const stepped = STEPS.exec(text);
  if (stepped) {
    const modifier = stepped[2] ?? 'jump-end';
    if ((STEPS_MODIFIERS as readonly string[]).includes(modifier)) {
      return steps(Number(stepped[1]), modifier as StepsModifier);
    }
  }

  throw new Error(`Invalid timing function "${value}". ${describe(easings)}`);
};

/**
 * {@link resolveTimingFunction} for a style value, which may list one timing
 * function per transition property or per animation.
 */
export const resolveTimingFunctions = (
  value: unknown,
  easings?: MotionEasings,
): unknown =>
  Array.isArray(value)
    ? value.map((entry) => resolveTimingFunction(entry, easings))
    : resolveTimingFunction(value, easings);
