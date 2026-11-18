import {
  ANIMATION_PRESETS,
  EXIT_ANIMATION_PRESETS,
  HOST_MOTION_STYLE_KEYS,
  MOTION_STYLE_KEYS,
} from '../constants/motion';
import {
  AnimationPresetName,
  ExitAnimationPresetName,
  MotionKeyframes,
} from '../types';

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
    const match = /^(\d*\.?\d+)(ms|s)$/.exec(value.trim());
    if (match) return Number(match[1]) * (match[2] === 's' ? 1000 : 1);
  }
  throw new Error(
    `Invalid motion time ${JSON.stringify(value)}: use '300ms', '0.3s' or milliseconds as a number`,
  );
};

// Keyframes are plain JSON (they come from project data or a preset table).
const copyKeyframes = (keyframes: MotionKeyframes): MotionKeyframes =>
  JSON.parse(JSON.stringify(keyframes)) as MotionKeyframes;

/**
 * The keyframes an `exitAnimationName` stands for: a preset's name becomes
 * a copy of that preset's keyframes (Reanimated's `Keyframe` rewrites the
 * object it is given), keyframes written in place are copied as they are.
 * A name that is not a preset throws.
 */
export const resolveExitKeyframes = (name: unknown): MotionKeyframes => {
  if (typeof name === 'string') {
    if (!isExitPresetName(name)) {
      throw new Error(
        `Unknown exit animation "${name}". Presets: ${Object.keys(EXIT_ANIMATION_PRESETS).join(', ')}`,
      );
    }
    return copyKeyframes(EXIT_ANIMATION_PRESETS[name]);
  }
  if (typeof name !== 'object' || name === null || Array.isArray(name)) {
    throw new Error(
      'exitAnimationName must be a preset name or a keyframes object',
    );
  }
  return copyKeyframes(name as MotionKeyframes);
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
 * The keyframes one `animationName` entry stands for: a preset's name
 * becomes that preset's keyframes, keyframes written in place pass through.
 * A name that is not a preset is a mistake in the project data, so it throws.
 */
const resolveAnimationName = (name: unknown): MotionKeyframes => {
  if (typeof name !== 'string') return name as MotionKeyframes;

  if (!isPresetName(name)) {
    throw new Error(
      `Unknown animation "${name}". Presets: ${Object.keys(ANIMATION_PRESETS).join(', ')}`,
    );
  }

  return ANIMATION_PRESETS[name];
};

/**
 * A flattened style ready for a Reanimated animated component: preset names
 * in `animationName` replaced by their keyframes and the keys that are not
 * CSS (`HOST_MOTION_STYLE_KEYS`) taken out. With `reducedMotion` every
 * motion key is dropped, so the element shows its style without moving.
 *
 * @param style - A flattened style that {@link hasMotion}
 * @param reducedMotion - Whether the OS asks for reduced motion
 */
export const resolveMotionStyle = (
  style: Style,
  reducedMotion: boolean,
): Style => {
  if (reducedMotion) {
    return Object.fromEntries(
      Object.entries(style).filter(
        ([key]) => !(MOTION_STYLE_KEYS as readonly string[]).includes(key),
      ),
    );
  }

  // The host keys become props of the animated component, never style.
  const css = Object.fromEntries(
    Object.entries(style).filter(
      ([key]) => !(HOST_MOTION_STYLE_KEYS as readonly string[]).includes(key),
    ),
  );
  const { animationName } = css;

  if (animationName == null) return css;

  return {
    ...css,
    animationName: Array.isArray(animationName)
      ? animationName.map(resolveAnimationName)
      : resolveAnimationName(animationName),
  };
};
