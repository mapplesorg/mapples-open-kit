/** What a motion command may ask of an element that has a `motionName`. */
export const MOTION_COMMANDS = ['play', 'pause', 'restart'] as const;

/**
 * `play` resumes a paused animation, or starts the animation again when it
 * is not paused; `pause` freezes it where it is; `restart` always starts it
 * again from its first keyframe.
 */
export type MotionCommand = (typeof MOTION_COMMANDS)[number];

/** One command, addressed to every element whose style has that `motionName`. */
export interface MotionCommandMessage {
  /** The `motionName` in the style of the element (or elements) to control. */
  target: string;
  command: MotionCommand;
  /**
   * `play` / `restart`: a preset from `ANIMATION_PRESETS` to play once in
   * place of the element's own animation (`shake` on a failed submit). The
   * element needs no animation of its own for it.
   */
  animation?: string;
  /** Length of that one-off animation: `'400ms'`, `'0.4s'` or milliseconds. */
  duration?: string | number;
}

type Listener = (message: MotionCommandMessage) => void;

// App-wide, like the names themselves: whoever hears the app's actions
// (`@mapples/components` `MotionActionHandler`) forwards them here, and each
// named element listens for its own.
const listeners = new Set<Listener>();

/** Whether a value is one of {@link MOTION_COMMANDS}. */
export const isMotionCommand = (value: unknown): value is MotionCommand =>
  (MOTION_COMMANDS as readonly unknown[]).includes(value);

/**
 * Sends a motion command to the elements named `message.target`. An element
 * takes a name through the `motionName` key of its style.
 *
 * @example
 * ```ts
 * sendMotionCommand({ target: 'sign-in-form', command: 'play', animation: 'shake' });
 * ```
 */
export const sendMotionCommand = (message: MotionCommandMessage): void => {
  listeners.forEach((listener) => listener(message));
};

/** Listens to every motion command; returns the function that stops it. */
export const subscribeMotionCommands = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
