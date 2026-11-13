import { ANIMATION_PRESETS, MOTION_STYLE_KEYS } from '../constants/motion';
import { AnimationPresetName, MotionKeyframes } from '../types';

type Style = Record<string, unknown>;

const isPresetName = (name: string): name is AnimationPresetName =>
  Object.hasOwn(ANIMATION_PRESETS, name);

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
 * in `animationName` replaced by their keyframes. With `reducedMotion` the
 * motion keys are dropped, so the element shows its style without moving.
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

  const { animationName } = style;

  if (animationName == null) return style;

  return {
    ...style,
    animationName: Array.isArray(animationName)
      ? animationName.map(resolveAnimationName)
      : resolveAnimationName(animationName),
  };
};
