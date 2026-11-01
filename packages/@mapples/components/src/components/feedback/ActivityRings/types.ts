import { Tone, TONES } from '@mapples/ui';

import { progressFraction } from '../ProgressBar/types';

/** One concentric ring, outermost first. */
export interface ActivityRing {
  /** Progress towards `max`; above `max` the ring is drawn full (overachieving is valid). */
  value: number;
  /** The goal that closes the ring; must be positive. */
  max: number;
  /** Colour role of the ring. Defaults by position: primary, accent, success, info, warning. */
  tone?: Tone;
  /** A literal colour or theme token; wins over `tone`. */
  color?: string;
  /** Name in the accessibility summary ("Move 420 of 600"). */
  label?: string;
}

/** Tones of rings that name neither `tone` nor `color`, by position. */
export const ACTIVITY_RINGS_TONES: readonly Tone[] = [
  'primary',
  'accent',
  'success',
  'info',
  'warning',
];

/** How many rings the component draws. */
export const ACTIVITY_RINGS_COUNT = { min: 1, max: 5 } as const;

/** Defaults shared by the component and its canvas schematic. */
export const ACTIVITY_RINGS_DEFAULTS = {
  size: 160,
  strokeWidth: 14,
  gap: 4,
} as const;

/** Opacity of a ring's track (its own colour, faded). */
export const ACTIVITY_RINGS_TRACK_OPACITY = 0.2;

/** A validated ring with its drawn fraction (0–1). */
export interface ResolvedActivityRing extends ActivityRing {
  fraction: number;
}

/**
 * The rings to draw. A malformed ring is a data error — it is reported,
 * never skipped. Values above `max` draw a full ring; negative values an
 * empty one.
 */
export const readActivityRings = (
  rings: unknown,
  component: string,
): ResolvedActivityRing[] => {
  const { min, max } = ACTIVITY_RINGS_COUNT;
  if (!Array.isArray(rings) || rings.length < min || rings.length > max) {
    throw new Error(
      `${component}: rings must be an array of ${min}–${max} {value, max, tone?, color?, label?}`,
    );
  }
  return rings.map((ring: unknown, index) => {
    if (typeof ring !== 'object' || ring === null) {
      throw new Error(
        `${component}: rings[${index}] must be {value: number, max: number, tone?, color?, label?}`,
      );
    }
    const entry = ring as ActivityRing;
    if (typeof entry.max !== 'number' || !Number.isFinite(entry.max)) {
      throw new Error(
        `${component}: rings[${index}].max (${String(entry.max)}) must be a finite number`,
      );
    }
    for (const key of ['color', 'label', 'tone'] as const) {
      if (entry[key] !== undefined && typeof entry[key] !== 'string') {
        throw new Error(
          `${component}: rings[${index}].${key} must be a string`,
        );
      }
    }
    if (entry.tone !== undefined && !TONES.includes(entry.tone)) {
      throw new Error(
        `${component}: rings[${index}].tone must be one of ${TONES.join(', ')}`,
      );
    }
    return {
      ...entry,
      fraction: progressFraction(
        entry.value,
        entry.max,
        `${component}: rings[${index}]`,
      ),
    };
  });
};

/** The spoken summary: "Move 420 of 600, Exercise 22 of 30". */
export const activityRingsSummary = (rings: ActivityRing[]): string =>
  rings
    .map(
      (ring, index) =>
        `${ring.label ?? `Ring ${index + 1}`} ${ring.value} of ${ring.max}`,
    )
    .join(', ');
