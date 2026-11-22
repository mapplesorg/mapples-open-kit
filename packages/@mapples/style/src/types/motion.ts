import { ANIMATION_PRESETS, EXIT_ANIMATION_PRESETS } from '../constants/motion';

/**
 * One keyframe set: a style per offset (`from`, `to`, or a percentage such
 * as `'50%'`), in the shape Reanimated's `animationName` takes.
 */
export type MotionKeyframes = Record<string, Record<string, unknown>>;

/**
 * The project's easing tokens: a name and the curve it stands for
 * (`{ spring: 'cubic-bezier(0.3, 1.4, 0.5, 1)' }`). A style refers to one as
 * `easing.spring` wherever a timing function goes.
 */
export type MotionEasings = Record<string, string>;

/**
 * The project's own keyframe sets by name. A style plays one by naming it in
 * `animationName` (or `exitAnimationName`), like a preset; a project set
 * with a preset's name takes that preset's place.
 */
export type MotionKeyframeSets = Record<string, MotionKeyframes>;

/**
 * The motion part of a project's style: what `animationName` and a timing
 * function may refer to besides what `@mapples/style` ships.
 */
export interface MotionTokens {
  easings?: MotionEasings;
  keyframes?: MotionKeyframeSets;
}

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
   * `step-end`; a curve as text, `cubic-bezier(0.3, 1.4, 0.5, 1)` (`y` may
   * overshoot) or `steps(4)`; or one of the project's easing tokens,
   * `easing.spring`. In code also an easing built with Reanimated's
   * `cubicBezier`, `steps` or `linear`. `Function` is what Expo's web types
   * use here, and the two must stay assignable.
   */
  transitionTimingFunction?: string | Function | (string | Function)[];
  /** `'300ms'` or `'0.3s'`. */
  transitionDelay?: string | string[];
  /** `normal` or `allow-discrete`. */
  transitionBehavior?: string | string[];
  /**
   * The name of one of the project's keyframe sets or of a preset (see
   * `ANIMATION_PRESETS`), or keyframes written in place
   * ({@link MotionKeyframes}). A name that is neither throws when the
   * element renders. A keyframe may carry its own `animationTimingFunction`
   * (the curve from that stop to the next).
   */
  animationName?:
    | string
    | Record<string, unknown>
    | (string | Record<string, unknown>)[];
  /** `'300ms'`, `'0.3s'`, or milliseconds as a number. */
  animationDuration?: string | string[] | number | number[];
  /** The same values as `transitionTimingFunction`. */
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
   * Set on a parent: each child starts its animation this much later than
   * the one before it (`'60ms'`, `'0.06s'`, or milliseconds as a number), on
   * top of the child's own `animationDelay`. It reaches the animated
   * elements inside each child too, so a card and its contents enter as one
   * step. The rows of a `FlatList` count as its children. Not a CSS key.
   */
  animationStagger?: string | number;
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
