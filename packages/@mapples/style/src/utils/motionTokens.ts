import { ANIMATION_PRESETS, EXIT_ANIMATION_PRESETS } from '../constants/motion';
import { MotionTokens } from '../types';

import { EASING_TOKEN_PREFIX, isTimingFunctionText } from './easing';

/** What an easing token or a keyframe set may be called: `spring`, `heroDrop`, `cupIn2`. */
export const MOTION_TOKEN_NAME = /^[A-Za-z][A-Za-z0-9]*$/;

const OFFSET = /^(from|to|\d{1,3}(\.\d+)?%)$/;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * The offset of a keyframe as a number from 0 to 100, or `undefined` when
 * the key is not one (`from` is 0, `to` is 100).
 */
export const keyframeOffset = (key: string): number | undefined => {
  if (!OFFSET.test(key)) return undefined;
  if (key === 'from') return 0;
  if (key === 'to') return 100;
  const percent = Number(key.slice(0, -1));
  return percent >= 0 && percent <= 100 ? percent : undefined;
};

/**
 * Everything wrong with a project's motion tokens, in words an author (or
 * the AI that wrote them) can act on; empty when they are sound. Checked
 * before tokens are saved, because a bad curve or keyframe otherwise throws
 * in every element that uses it.
 *
 * @param tokens - The motion part of a project's style
 */
export const validateMotionTokens = (tokens: unknown): string[] => {
  if (tokens == null) return [];
  if (!isPlainObject(tokens)) return ['motion must be an object'];

  const errors: string[] = [];
  const { easings, keyframes, ...rest } = tokens as MotionTokens &
    Record<string, unknown>;

  for (const key of Object.keys(rest)) {
    errors.push(`motion.${key} is not a known part (easings, keyframes)`);
  }

  if (easings != null && !isPlainObject(easings)) {
    errors.push('motion.easings must be an object of name → curve');
  } else {
    for (const [name, curve] of Object.entries(easings ?? {})) {
      if (!MOTION_TOKEN_NAME.test(name)) {
        errors.push(
          `easing "${name}": a name is letters and digits, starting with a letter (e.g. heroDrop)`,
        );
      }
      if (typeof curve !== 'string' || !isTimingFunctionText(curve)) {
        errors.push(
          `easing "${name}": ${JSON.stringify(curve)} is not a curve; use cubic-bezier(x1, y1, x2, y2) with x1 and x2 between 0 and 1, steps(n) or a named timing function`,
        );
      }
    }
  }

  if (keyframes != null && !isPlainObject(keyframes)) {
    errors.push('motion.keyframes must be an object of name → keyframes');
    return errors;
  }

  const easingNames = isPlainObject(easings) ? Object.keys(easings) : [];

  for (const [name, set] of Object.entries(keyframes ?? {})) {
    if (!MOTION_TOKEN_NAME.test(name)) {
      errors.push(
        `keyframes "${name}": a name is letters and digits, starting with a letter (e.g. cupDrop)`,
      );
    }
    if (!isPlainObject(set) || Object.keys(set).length < 2) {
      errors.push(
        `keyframes "${name}": needs at least two stops, e.g. { from: {...}, to: {...} }`,
      );
      continue;
    }
    for (const [offset, block] of Object.entries(set)) {
      if (keyframeOffset(offset) === undefined) {
        errors.push(
          `keyframes "${name}": "${offset}" is not a stop; use from, to or a percentage from 0% to 100%`,
        );
      }
      if (!isPlainObject(block)) {
        errors.push(
          `keyframes "${name}" at ${offset}: must be an object of style values`,
        );
        continue;
      }
      const timing = block.animationTimingFunction;
      if (timing == null) continue;
      const known =
        typeof timing === 'string' &&
        (timing.startsWith(EASING_TOKEN_PREFIX)
          ? easingNames.includes(timing.slice(EASING_TOKEN_PREFIX.length))
          : isTimingFunctionText(timing));
      if (!known) {
        errors.push(
          `keyframes "${name}" at ${offset}: animationTimingFunction ${JSON.stringify(timing)} is not a curve or one of the project's easing tokens`,
        );
      }
    }
  }

  return errors;
};

/**
 * Whether a name is taken by a keyframe set that ships with `@mapples/style`.
 * A project set may reuse one on purpose (it takes the preset's place), so
 * this is a warning for an editor, not an error.
 */
export const isBuiltInAnimationName = (name: string): boolean =>
  Object.hasOwn(ANIMATION_PRESETS, name) ||
  Object.hasOwn(EXIT_ANIMATION_PRESETS, name);
