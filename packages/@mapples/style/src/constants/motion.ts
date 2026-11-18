import { MotionKeyframes, MotionStyleKey } from '../types';

/**
 * Style keys that describe motion. An element whose style carries one of
 * them is rendered through a Reanimated animated component; every other
 * element stays a plain React Native view.
 */
export const MOTION_STYLE_KEYS = [
  'transitionProperty',
  'transitionDuration',
  'transitionTimingFunction',
  'transitionDelay',
  'transitionBehavior',
  'animationName',
  'animationDuration',
  'animationTimingFunction',
  'animationDelay',
  'animationIterationCount',
  'animationDirection',
  'animationFillMode',
  'animationPlayState',
  'animationReplay',
  'motionName',
  'exitAnimationName',
  'exitAnimationDuration',
  'exitAnimationDelay',
  'layoutTransitionDuration',
] as const satisfies readonly MotionStyleKey[];

/**
 * The motion keys that are not CSS: `styled()` reads them and passes the
 * animated host an `exiting` / `layout` animation (or replays the enter
 * animation) instead of leaving them in the style.
 */
export const HOST_MOTION_STYLE_KEYS = [
  'animationReplay',
  'motionName',
  'exitAnimationName',
  'exitAnimationDuration',
  'exitAnimationDelay',
  'layoutTransitionDuration',
] as const satisfies readonly MotionStyleKey[];

/**
 * The key a parent spreads its children's animations with. It is not CSS and
 * does not make the parent itself an animated host: `styled()` takes it out
 * of the style and tells each child how much later to start.
 */
export const STAGGER_STYLE_KEY = 'animationStagger';

/** How long a leave animation runs when the style names no duration, in ms. */
export const EXIT_ANIMATION_DURATION = 200;

/** How long a preset a motion command plays once runs by default, in ms. */
export const ONE_OFF_ANIMATION_DURATION = 400;

/**
 * Stands in keyframes for the colour of the element that plays them (its
 * `backgroundColor`, else its `color`) at an alpha: `$color(0.55)`.
 * `resolveMotionStyle` puts the colour in its place, so a ring that pulses
 * out of a green button is green without keyframes written for that button.
 */
export const ELEMENT_COLOR_PATTERN = /\$color\(\s*([\d.]+)\s*\)/g;

/**
 * Keyframes a style can name in `animationName` instead of writing them out.
 * The enter presets end on the element's own style, so with reduced motion
 * (the animation dropped) the element simply shows as designed.
 */
export const ANIMATION_PRESETS = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeInUp: {
    from: { opacity: 0, transform: [{ translateY: 16 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  fadeInDown: {
    from: { opacity: 0, transform: [{ translateY: -16 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  slideInLeft: {
    from: { opacity: 0, transform: [{ translateX: -32 }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },
  slideInRight: {
    from: { opacity: 0, transform: [{ translateX: 32 }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },
  zoomIn: {
    from: { opacity: 0, transform: [{ scale: 0.9 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
  },
  bounceIn: {
    '0%': { opacity: 0, transform: [{ scale: 0.3 }] },
    '50%': { opacity: 1, transform: [{ scale: 1.05 }] },
    '70%': { transform: [{ scale: 0.95 }] },
    '100%': { opacity: 1, transform: [{ scale: 1 }] },
  },
  pulse: {
    '0%': { transform: [{ scale: 1 }] },
    '50%': { transform: [{ scale: 1.05 }] },
    '100%': { transform: [{ scale: 1 }] },
  },
  spin: {
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
  },
  shake: {
    '0%': { transform: [{ translateX: 0 }] },
    '20%': { transform: [{ translateX: -6 }] },
    '40%': { transform: [{ translateX: 6 }] },
    '60%': { transform: [{ translateX: -6 }] },
    '80%': { transform: [{ translateX: 6 }] },
    '100%': { transform: [{ translateX: 0 }] },
  },
  bounce: {
    '0%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -8 }] },
    '100%': { transform: [{ translateY: 0 }] },
  },
  blink: {
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  rise: {
    from: { opacity: 0, transform: [{ translateY: 20 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  pop: {
    '0%': { opacity: 0, transform: [{ scale: 0.4 }] },
    '70%': { opacity: 1, transform: [{ scale: 1.1 }] },
    '100%': { opacity: 1, transform: [{ scale: 1 }] },
  },
  stampIn: {
    '0%': { opacity: 0, transform: [{ scale: 2.2 }, { rotate: '-12deg' }] },
    '60%': { opacity: 1, transform: [{ scale: 0.95 }, { rotate: '0deg' }] },
    '100%': { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }] },
  },
  dropIn: {
    '0%': {
      opacity: 0,
      transform: [{ translateY: -60 }, { rotate: '-14deg' }, { scale: 0.85 }],
    },
    '60%': {
      opacity: 1,
      transform: [{ translateY: 8 }, { rotate: '4deg' }, { scale: 1 }],
    },
    '100%': {
      opacity: 1,
      transform: [{ translateY: 0 }, { rotate: '0deg' }, { scale: 1 }],
    },
  },
  float: {
    '0%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -8 }] },
    '100%': { transform: [{ translateY: 0 }] },
  },
  bob: {
    '0%': { transform: [{ translateY: 0 }, { rotate: '-8deg' }] },
    '50%': { transform: [{ translateY: -10 }, { rotate: '10deg' }] },
    '100%': { transform: [{ translateY: 0 }, { rotate: '-8deg' }] },
  },
  pulseRing: {
    from: { boxShadow: '0 0 0 0 $color(0.55)' },
    to: { boxShadow: '0 0 0 16px $color(0)' },
  },
  shine: {
    '0%': { transform: [{ translateX: '-150%' }, { skewX: '-20deg' }] },
    '55%': { transform: [{ translateX: '-150%' }, { skewX: '-20deg' }] },
    '100%': { transform: [{ translateX: '900%' }, { skewX: '-20deg' }] },
  },
  scanLine: {
    '0%': { top: '6%' },
    '50%': { top: '90%' },
    '100%': { top: '6%' },
  },
} as const satisfies Record<string, MotionKeyframes>;

/**
 * Keyframes a style can name in `exitAnimationName`: how the element leaves
 * when it stops being rendered. Each mirrors an enter preset. They start at
 * full opacity and no offset, the way an element normally rests.
 */
export const EXIT_ANIMATION_PRESETS = {
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  fadeOutUp: {
    from: { opacity: 1, transform: [{ translateY: 0 }] },
    to: { opacity: 0, transform: [{ translateY: -16 }] },
  },
  fadeOutDown: {
    from: { opacity: 1, transform: [{ translateY: 0 }] },
    to: { opacity: 0, transform: [{ translateY: 16 }] },
  },
  slideOutLeft: {
    from: { opacity: 1, transform: [{ translateX: 0 }] },
    to: { opacity: 0, transform: [{ translateX: -32 }] },
  },
  slideOutRight: {
    from: { opacity: 1, transform: [{ translateX: 0 }] },
    to: { opacity: 0, transform: [{ translateX: 32 }] },
  },
  zoomOut: {
    from: { opacity: 1, transform: [{ scale: 1 }] },
    to: { opacity: 0, transform: [{ scale: 0.9 }] },
  },
} as const satisfies Record<string, MotionKeyframes>;

/**
 * What each preset is for: `enter` plays once when the element appears and
 * ends on the element's own style; `loop` is meant to repeat.
 */
export const ANIMATION_PRESET_KINDS = {
  fadeIn: 'enter',
  fadeInUp: 'enter',
  fadeInDown: 'enter',
  slideInLeft: 'enter',
  slideInRight: 'enter',
  zoomIn: 'enter',
  bounceIn: 'enter',
  pulse: 'loop',
  spin: 'loop',
  shake: 'loop',
  bounce: 'loop',
  blink: 'loop',
  rise: 'enter',
  pop: 'enter',
  stampIn: 'enter',
  dropIn: 'enter',
  float: 'loop',
  bob: 'loop',
  pulseRing: 'loop',
  shine: 'loop',
  scanLine: 'loop',
} as const satisfies Record<keyof typeof ANIMATION_PRESETS, 'enter' | 'loop'>;

/**
 * The timing a preset is designed for, where the kind's usual one (an enter
 * that eases over half a second, a loop of 1.2 s) would read wrong: a pop
 * needs a curve that overshoots, a float is slow. An editor writes these
 * next to the name when the preset is picked; the runtime does not add them.
 */
export const ANIMATION_PRESET_TIMING: Partial<
  Record<
    keyof typeof ANIMATION_PRESETS,
    { duration?: string; timingFunction?: string }
  >
> = {
  rise: { duration: '550ms', timingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  pop: { duration: '400ms', timingFunction: 'cubic-bezier(0.3, 1.4, 0.5, 1)' },
  stampIn: {
    duration: '700ms',
    timingFunction: 'cubic-bezier(0.3, 1.3, 0.5, 1)',
  },
  dropIn: {
    duration: '900ms',
    timingFunction: 'cubic-bezier(0.2, 0.9, 0.25, 1.1)',
  },
  float: { duration: '4000ms', timingFunction: 'ease-in-out' },
  bob: { duration: '3200ms', timingFunction: 'ease-in-out' },
  pulseRing: { duration: '1800ms', timingFunction: 'ease-out' },
  shine: { duration: '3600ms', timingFunction: 'ease-in-out' },
  scanLine: { duration: '2400ms', timingFunction: 'ease-in-out' },
};

/**
 * How many children a stagger spreads its delays over: the ones after that
 * start together with the last of them, so a long list never waits seconds
 * for its tail.
 */
export const STAGGER_MAX_STEPS = 12;
