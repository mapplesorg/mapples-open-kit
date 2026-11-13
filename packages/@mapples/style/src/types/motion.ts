import { ANIMATION_PRESETS } from '../constants/motion';

/**
 * One keyframe set: a style per offset (`from`, `to`, or a percentage such
 * as `'50%'`), in the shape Reanimated's `animationName` takes.
 */
export type MotionKeyframes = Record<string, Record<string, unknown>>;

/** A keyframe set that ships with `@mapples/style`. */
export type AnimationPresetName = keyof typeof ANIMATION_PRESETS;

/**
 * The motion a style can carry: CSS-style transitions (animate a style
 * property whenever its value changes) and keyframe animations (play when
 * the element mounts). An element with any of these keys is rendered through
 * a Reanimated animated component.
 *
 * Expo's web types (`expo/types/react-native-web.d.ts`) declare most of these
 * keys on the React Native style types of an app. The value types here are
 * the same as theirs, so a style typed in an app and one typed in this
 * package are assignable to each other; the comments name what is accepted.
 */
export interface MotionStyleProps {
  /** Style properties that animate when they change (`'opacity'`, `'all'`). */
  transitionProperty?: string | string[];
  /** `'300ms'`, `'0.3s'`, or milliseconds as a number. */
  transitionDuration?: string | string[] | number;
  /**
   * `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`, `step-start` or
   * `step-end` (the only form project data can hold); in code also an easing
   * built with Reanimated's `cubicBezier`, `steps` or `linear`. `Function` is
   * what Expo's web types use here, and the two must stay assignable.
   */
  transitionTimingFunction?: string | Function | (string | Function)[];
  /** `'300ms'` or `'0.3s'`. */
  transitionDelay?: string | string[];
  /** `normal` or `allow-discrete`. */
  transitionBehavior?: string | string[];
  /**
   * A preset's name (see `ANIMATION_PRESETS`) or keyframes written in place
   * ({@link MotionKeyframes}). A name that is not a preset throws when the
   * element renders.
   */
  animationName?:
    | string
    | Record<string, unknown>
    | (string | Record<string, unknown>)[];
  /** `'300ms'`, `'0.3s'`, or milliseconds as a number. */
  animationDuration?: string | string[] | number | number[];
  /** The timing function names of `transitionTimingFunction`. */
  animationTimingFunction?: string | string[];
  /** `'300ms'`, `'0.3s'`, or milliseconds as a number. */
  animationDelay?: string | string[] | number | number[];
  animationIterationCount?: number | 'infinite' | (number | 'infinite')[];
  /** `normal`, `reverse`, `alternate` or `alternate-reverse`. */
  animationDirection?: string | string[];
  /** `none`, `forwards`, `backwards` or `both`. */
  animationFillMode?: string | string[];
  /** `running` or `paused`. */
  animationPlayState?: string | string[];
}

/** A style key that describes motion (`transitionDuration`, `animationName`, …). */
export type MotionStyleKey = keyof MotionStyleProps;
