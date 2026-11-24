import {
  ANIMATION_PRESETS,
  ELEMENT_COLOR_PATTERN,
  EXIT_ANIMATION_PRESETS,
  HOST_MOTION_STYLE_KEYS,
  MOTION_STYLE_KEYS,
  STAGGER_MAX_STEPS,
  STAGGER_STYLE_KEY,
} from '../constants/motion';
import {
  AnimationPresetName,
  ExitAnimationPresetName,
  MotionKeyframes,
  MotionTokens,
} from '../types';

import { withAlpha } from './color';
import { resolveTimingFunction, resolveTimingFunctions } from './easing';

type Style = Record<string, unknown>;

const isPresetName = (name: string): name is AnimationPresetName =>
  Object.hasOwn(ANIMATION_PRESETS, name);

const isExitPresetName = (name: string): name is ExitAnimationPresetName =>
  Object.hasOwn(EXIT_ANIMATION_PRESETS, name);

/**
 * A motion time in milliseconds: `'300ms'`, `'0.3s'`, or a number that
 * already is milliseconds. `undefined` when the style names none. Anything
 * else is a mistake in the project data, so it throws.
 */
export const parseMotionTime = (value: unknown): number | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string') {
    const match = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/.exec(value.trim());
    if (match) return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
  }
  throw new Error(
    `Invalid motion time ${JSON.stringify(value)}: use '300ms', '0.3s' or milliseconds as a number`,
  );
};

// Keyframes are plain JSON (they come from project data or a preset table).
const copyKeyframes = (keyframes: MotionKeyframes): MotionKeyframes =>
  JSON.parse(JSON.stringify(keyframes)) as MotionKeyframes;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isKeyframes = (value: unknown): value is MotionKeyframes =>
  isPlainObject(value);

/**
 * The colour keyframes mean by `$color(alpha)`: the element's background,
 * else its text colour. Only looked up when keyframes use the placeholder.
 */
const elementColor = (style: Style, name: string): string => {
  const color = style.backgroundColor ?? style.color;
  if (typeof color !== 'string') {
    throw new Error(
      `Animation "${name}" takes the colour of its element: give the element a backgroundColor (or a color)`,
    );
  }
  return color;
};

/** Resolves a colour a keyframe names (`theme.primary.main`) to a value. */
export type MotionColorResolver = (color: string) => string;

const THEME_TOKEN = /"(theme\.[\w.]+)"/g;

/**
 * Reanimated restarts an animation whose keyframes change, so the same
 * keyframes must come back as the same object from one render to the next.
 * Keyed by the keyframes as they will play; small and bounded.
 */
const PREPARED_LIMIT = 500;
const prepared = new Map<string, MotionKeyframes>();

/**
 * Keyframes as Reanimated plays them: `$color(alpha)` replaced by the
 * element's colour, theme colours (`theme.primary.main`) by their value in
 * the current scheme, and each stop's own timing function resolved (a curve
 * as text, an easing token). The source is never changed.
 */
const cachedKeyframes = (
  keyframes: MotionKeyframes,
  label: string,
  style: Style,
  tokens: MotionTokens | undefined,
  getColor: MotionColorResolver | undefined,
): MotionKeyframes => {
  let text = JSON.stringify(keyframes);
  if (text.includes('$color(')) {
    const color = elementColor(style, label);
    // `replace` with a global pattern starts from its `lastIndex` of 0.
    text = text.replace(ELEMENT_COLOR_PATTERN, (_match, alpha: string) =>
      withAlpha(color, Number(alpha)),
    );
  }
  if (getColor && text.includes('"theme.')) {
    text = text.replace(THEME_TOKEN, (_match, path: string) =>
      JSON.stringify(getColor(path)),
    );
  }

  const key = text.includes('easing.')
    ? `${text}|${JSON.stringify(tokens?.easings ?? {})}`
    : text;
  const hit = prepared.get(key);
  if (hit) return hit;

  const value = JSON.parse(text) as Record<string, unknown>;
  for (const [offset, block] of Object.entries(value)) {
    if (!isPlainObject(block)) {
      throw new Error(
        `Animation "${label}": keyframe "${offset}" must be an object of style values`,
      );
    }
    if (block.animationTimingFunction != null) {
      block.animationTimingFunction = resolveTimingFunction(
        block.animationTimingFunction,
        tokens?.easings,
      );
    }
  }

  if (prepared.size >= PREPARED_LIMIT) prepared.clear();
  prepared.set(key, value as MotionKeyframes);
  return value as MotionKeyframes;
};

/**
 * The keyframes an `exitAnimationName` stands for: the name of one of the
 * project's keyframe sets or of a preset becomes a copy of those keyframes
 * (Reanimated's `Keyframe` rewrites the object it is given), keyframes
 * written in place are copied as they are. A name that is neither throws.
 */
export const resolveExitKeyframes = (
  name: unknown,
  tokens?: MotionTokens,
): MotionKeyframes => {
  if (typeof name === 'string') {
    const own = tokens?.keyframes?.[name];
    if (own) return copyKeyframes(own);
    if (!isExitPresetName(name)) {
      throw new Error(
        `Unknown exit animation "${name}". Presets: ${Object.keys(EXIT_ANIMATION_PRESETS).join(', ')}${describeProjectSets(tokens)}`,
      );
    }
    return copyKeyframes(EXIT_ANIMATION_PRESETS[name]);
  }
  if (!isKeyframes(name)) {
    throw new Error(
      'exitAnimationName must be a preset name or a keyframes object',
    );
  }
  return copyKeyframes(name);
};

const describeProjectSets = (tokens: MotionTokens | undefined) => {
  const names = Object.keys(tokens?.keyframes ?? {});
  return names.length ? `. Project keyframes: ${names.join(', ')}` : '';
};

/**
 * Whether a style value is a selector value: `{ default: 1, ':active': 0.4 }`,
 * the value outside any state and the value in each state (Reanimated's
 * pseudo-selector form).
 */
export const isSelectorValue = (
  value: unknown,
): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const keys = Object.keys(value);
  return (
    keys.some((key) => key.startsWith(':')) &&
    keys.every((key) => key === 'default' || key.startsWith(':'))
  );
};

/**
 * Whether a flattened style has a value that depends on an interaction state
 * (pressed, hovered, focused). Like motion, that takes the animated host.
 */
export const hasSelectorValues = (style: Style | undefined): style is Style =>
  style !== undefined && Object.values(style).some(isSelectorValue);

/**
 * Whether a flattened style carries a motion key with a value. A key an
 * editor cleared (left `undefined` or `null`) does not count.
 */
export const hasMotion = (style: Style | undefined): style is Style =>
  style !== undefined && MOTION_STYLE_KEYS.some((key) => style[key] != null);

/**
 * The keyframes one `animationName` entry stands for: the name of one of
 * the project's keyframe sets, else of a preset, becomes those keyframes;
 * keyframes written in place pass through. A name that is neither is a
 * mistake in the project data, so it throws.
 */
const resolveAnimationName = (
  name: unknown,
  style: Style,
  tokens: MotionTokens | undefined,
  getColor: MotionColorResolver | undefined,
): MotionKeyframes => {
  if (typeof name !== 'string') {
    if (!isKeyframes(name)) {
      throw new Error('animationName must be a name or a keyframes object');
    }
    return cachedKeyframes(name, 'keyframes', style, tokens, getColor);
  }

  const own = tokens?.keyframes?.[name];
  if (own) return cachedKeyframes(own, name, style, tokens, getColor);

  if (!isPresetName(name)) {
    throw new Error(
      `Unknown animation "${name}". Presets: ${Object.keys(ANIMATION_PRESETS).join(', ')}${describeProjectSets(tokens)}`,
    );
  }

  return cachedKeyframes(
    ANIMATION_PRESETS[name],
    name,
    style,
    tokens,
    getColor,
  );
};

const TIMING_FUNCTION_KEYS = [
  'transitionTimingFunction',
  'animationTimingFunction',
] as const;

/** `delay` plus `extra` milliseconds, as a time Reanimated takes. */
const delayedBy = (delay: unknown, extra: number): unknown =>
  Array.isArray(delay)
    ? delay.map((entry) => delayedBy(entry, extra))
    : `${(parseMotionTime(delay) ?? 0) + extra}ms`;

/** What {@link resolveMotionStyle} needs besides the style. */
export interface MotionResolution {
  /** Whether the OS asks for reduced motion (or a provider turned motion off). */
  reducedMotion: boolean;
  /** The project's easing tokens and keyframe sets. */
  tokens?: MotionTokens;
  /**
   * How much later the element's animation starts because of the
   * `animationStagger` of an element above it, in milliseconds.
   */
  staggerDelay?: number;
  /** Resolves the theme colours project keyframes name. */
  getColor?: MotionColorResolver;
}

/**
 * A flattened style ready for a Reanimated animated component: names in
 * `animationName` replaced by their keyframes, timing functions written as
 * text (a curve, an easing token) turned into Reanimated's easings, the
 * stagger delay added, and the keys that are not CSS
 * (`HOST_MOTION_STYLE_KEYS`) taken out. With `reducedMotion` every motion
 * key is dropped, so the element shows its style without moving.
 *
 * @param style - A flattened style that {@link hasMotion}
 * @param resolution - Reduced motion, the project's motion tokens, stagger
 */
export const resolveMotionStyle = (
  style: Style,
  { reducedMotion, tokens, staggerDelay = 0, getColor }: MotionResolution,
): Style => {
  if (reducedMotion) {
    return Object.fromEntries(
      Object.entries(style).filter(
        ([key]) =>
          key !== STAGGER_STYLE_KEY &&
          !(MOTION_STYLE_KEYS as readonly string[]).includes(key),
      ),
    );
  }

  // The host keys become props of the animated component, never style.
  const css = Object.fromEntries(
    Object.entries(style).filter(
      ([key]) =>
        key !== STAGGER_STYLE_KEY &&
        !(HOST_MOTION_STYLE_KEYS as readonly string[]).includes(key),
    ),
  );

  for (const key of TIMING_FUNCTION_KEYS) {
    if (css[key] != null) {
      css[key] = resolveTimingFunctions(css[key], tokens?.easings);
    }
  }

  const { animationName } = css;

  if (animationName == null) return css;

  css.animationName = Array.isArray(animationName)
    ? animationName.map((name) =>
        resolveAnimationName(name, style, tokens, getColor),
      )
    : resolveAnimationName(animationName, style, tokens, getColor);

  if (staggerDelay > 0) {
    css.animationDelay = delayedBy(css.animationDelay, staggerDelay);
    // While it waits for its turn the element holds its first keyframe, or
    // it would show, vanish and then enter.
    css.animationFillMode ??= 'backwards';
  }

  return css;
};

/**
 * A flattened style without the stagger key, which is an instruction to
 * `styled()` and never reaches a view.
 */
export const withoutStagger = (style: Style): Style => {
  if (!(STAGGER_STYLE_KEY in style)) return style;
  const { [STAGGER_STYLE_KEY]: _stagger, ...rest } = style;
  return rest;
};

/**
 * How much later each row of a list starts than the one before it, in
 * milliseconds: the list's rows are not React children of its container, so
 * the list spreads them itself (`MotionStagger`). Rows past
 * `STAGGER_MAX_STEPS` mount while scrolling and start at once.
 *
 * @param index - The row's index in the list
 * @param step - The container's `animationStagger`
 */
export const staggerRowDelay = (index: number, step: unknown): number => {
  const ms = parseMotionTime(step);
  return ms && index <= STAGGER_MAX_STEPS ? index * ms : 0;
};
