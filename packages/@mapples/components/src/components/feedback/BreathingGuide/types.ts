/** What the breath does during a phase. */
export const BREATHING_PHASE_KINDS = ['inhale', 'hold', 'exhale'] as const;
export type BreathingPhaseKind = (typeof BREATHING_PHASE_KINDS)[number];

/** One step of a breathing pattern. */
export interface BreathingPhase {
  /** Text in the centre and the legend ("Inhale"). */
  label: string;
  /** Length of the phase in seconds; must be positive. */
  seconds: number;
  /** `inhale` grows the rings, `exhale` shrinks them, `hold` keeps them still. */
  kind: BreathingPhaseKind;
}

/** The 4-7-8 relaxing breath: in for 4, hold for 7, out for 8. */
export const BREATHING_GUIDE_DEFAULT_PATTERN: readonly BreathingPhase[] = [
  { label: 'Inhale', seconds: 4, kind: 'inhale' },
  { label: 'Hold', seconds: 7, kind: 'hold' },
  { label: 'Exhale', seconds: 8, kind: 'exhale' },
];

/** How many phases a pattern may have. */
export const BREATHING_GUIDE_PHASES = { min: 1, max: 8 } as const;

/** Defaults shared by the component and its canvas schematic. */
export const BREATHING_GUIDE_DEFAULTS = {
  size: 240,
} as const;

/**
 * The concentric rings, outermost first: diameter as a fraction of `size`,
 * scale while empty (fully exhaled) and fill opacity.
 */
export const BREATHING_GUIDE_RINGS: readonly {
  diameter: number;
  minScale: number;
  opacity: number;
}[] = [
  { diameter: 1, minScale: 0.5, opacity: 0.12 },
  { diameter: 0.8, minScale: 0.58, opacity: 0.2 },
  { diameter: 0.62, minScale: 0.7, opacity: 0.32 },
];

/** Diameter of the solid centre disc as a fraction of `size`. */
export const BREATHING_GUIDE_CENTRE = 0.42;

/**
 * The validated pattern. A malformed phase is a data error — it is reported,
 * never skipped.
 */
export const readBreathingPattern = (
  pattern: unknown,
  component: string,
): BreathingPhase[] => {
  const { min, max } = BREATHING_GUIDE_PHASES;
  if (!Array.isArray(pattern) || pattern.length < min || pattern.length > max) {
    throw new Error(
      `${component}: pattern must be an array of ${min}–${max} {label, seconds, kind}`,
    );
  }
  return pattern.map((phase: unknown, index) => {
    if (typeof phase !== 'object' || phase === null) {
      throw new Error(
        `${component}: pattern[${index}] must be {label: string, seconds: number, kind: ${BREATHING_PHASE_KINDS.join(' | ')}}`,
      );
    }
    const entry = phase as BreathingPhase;
    if (typeof entry.label !== 'string' || entry.label.trim() === '') {
      throw new Error(
        `${component}: pattern[${index}].label must be a non-empty string`,
      );
    }
    if (
      typeof entry.seconds !== 'number' ||
      !Number.isFinite(entry.seconds) ||
      entry.seconds <= 0
    ) {
      throw new Error(
        `${component}: pattern[${index}].seconds (${String(entry.seconds)}) must be a positive number`,
      );
    }
    if (!BREATHING_PHASE_KINDS.includes(entry.kind)) {
      throw new Error(
        `${component}: pattern[${index}].kind (${String(entry.kind)}) must be one of ${BREATHING_PHASE_KINDS.join(', ')}`,
      );
    }
    return { label: entry.label, seconds: entry.seconds, kind: entry.kind };
  });
};

/**
 * How full the rings are (0 exhaled – 1 inhaled) at the start and end of
 * every phase. `inhale` and `exhale` set an absolute level, so the level the
 * cycle ends on is also the level it (re)starts from; a pattern without
 * either stays at 0.
 */
export const breathingLevels = (
  pattern: BreathingPhase[],
): { from: number; to: number }[] => {
  const next = (current: number, phase: BreathingPhase): number =>
    phase.kind === 'inhale' ? 1 : phase.kind === 'exhale' ? 0 : current;
  // Seeded with the end of a first pass so the loop is seamless.
  let level = pattern.reduce(next, 0);
  return pattern.map((phase) => {
    const from = level;
    level = next(level, phase);
    return { from, to: level };
  });
};

/** The whole seconds left that the centre shows (never below 1). */
export const breathingCount = (seconds: number): number =>
  Math.max(1, Math.ceil(seconds));
