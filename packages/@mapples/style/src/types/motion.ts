import { ANIMATION_PRESETS, EXIT_ANIMATION_PRESETS } from '../constants/motion';

/**
 * One keyframe set: a style per offset (`from`, `to`, or a percentage such
 * as `'50%'`), in the shape Reanimated's `animationName` takes.
 */
export type MotionKeyframes = Record<string, Record<string, unknown>>;

/** A keyframe set that ships with `@mapples/style`. */
export type AnimationPresetName = keyof typeof ANIMATION_PRESETS;

/** A leave animation that ships with `@mapples/style`. */
export type ExitAnimationPresetName = keyof typeof EXIT_ANIMATION_PRESETS;

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
  /**
   * When an enter or loop animation plays again besides the mount: `focus`
   * replays it each time the element's screen gains focus (a tab that stays
   * mounted). Not a CSS key; `styled()` reads it and keeps it off the view.
   */
  animationReplay?: 'focus';
  /**
   * The name motion commands address the element by (`sendMotionCommand`,
   * the `mapples:animation` action): play, pause or restart its animation,
   * or play a preset on it once. Not a CSS key; `styled()` listens under it.
   */
  motionName?: string;
  /**
   * How the element leaves when it stops being rendered (hidden by a state,
   * removed from a list): a preset's name (see `EXIT_ANIMATION_PRESETS`) or
   * keyframes written in place. Not a CSS key; `styled()` turns it into
   * Reanimated's `exiting` animation, which keeps the view until it ends.
   */
  exitAnimationName?: string | Record<string, unknown>;
  /** `'200ms'`, `'0.2s'`, or milliseconds as a number. Defaults to 200 ms. */
  exitAnimationDuration?: string | number;
  /** `'100ms'`, `'0.1s'`, or milliseconds as a number. */
  exitAnimationDelay?: string | number;
  /**
   * Animates the element to its new position and size when the layout
   * around it changes (a sibling appears, leaves or resizes): `'300ms'`,
   * `'0.3s'`, or milliseconds as a number. Not a CSS key; `styled()` turns
   * it into Reanimated's `layout` transition.
   */
  layoutTransitionDuration?: string | number;
}

/** A style key that describes motion (`transitionDuration`, `animationName`, …). */
export type MotionStyleKey = keyof MotionStyleProps;
