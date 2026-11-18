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

/** How long a leave animation runs when the style names no duration, in ms. */
export const EXIT_ANIMATION_DURATION = 200;

/** How long a preset a motion command plays once runs by default, in ms. */
export const ONE_OFF_ANIMATION_DURATION = 400;

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
} as const satisfies Record<keyof typeof ANIMATION_PRESETS, 'enter' | 'loop'>;
