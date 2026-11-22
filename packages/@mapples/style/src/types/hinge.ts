/**
 * Status of a device hinge, named as `expo-hinge` names it. Android never
 * reports `closed`; it reports `unknown` while the app's window does not span
 * the fold.
 */
export type HingeStatus = 'closed' | 'partiallyOpen' | 'fullyOpen' | 'unknown';

/**
 * State of the hinge of a foldable device, in the shape `expo-hinge` reports
 * it, so its `useHinge()` value can be handed to `HingeProvider` unchanged.
 */
export interface Hinge {
  /** The angle of the hinge in degrees: `0` is closed and `180` is flat. */
  angle: number;
  status: HingeStatus;
}
