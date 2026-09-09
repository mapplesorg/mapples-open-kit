/** Layout direction of the step indicator. */
export const STEPS_ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type StepsOrientation = (typeof STEPS_ORIENTATIONS)[number];

/** Indicator style: numbers, small dots, or a check for done steps. */
export const STEPS_VARIANTS = ['numbered', 'dot', 'icon'] as const;
export type StepsVariant = (typeof STEPS_VARIANTS)[number];

/** Where a step stands relative to `current`. */
export type StepStatus = 'done' | 'current' | 'upcoming';

/** One step. */
export interface StepItem {
  /** Visible text. */
  label: string;
  /** Supporting text under the label. */
  description?: string;
}

export interface StepsGeometry {
  /** Indicator diameter. */
  indicator: number;
  /** Indicator border width. */
  border: number;
  /** Check glyph size (icon variant). */
  glyph: number;
}

/** Indicator geometry per variant. */
export const STEPS_GEOMETRY: Record<StepsVariant, StepsGeometry> = {
  numbered: { indicator: 28, border: 2, glyph: 16 },
  dot: { indicator: 10, border: 2, glyph: 0 },
  icon: { indicator: 28, border: 2, glyph: 16 },
};

/** Connector thickness in points. */
export const STEPS_CONNECTOR_THICKNESS = 2;

/** `true` when `value` is a well-formed step. */
export const isStepItem = (value: unknown): value is StepItem =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as StepItem).label === 'string' &&
  ((value as StepItem).description === undefined ||
    typeof (value as StepItem).description === 'string');

/**
 * The steps an indicator renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readStepItems = (items: unknown): StepItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error('Steps: items must be an array of {label, description?}');
  }
  items.forEach((item, index) => {
    if (!isStepItem(item)) {
      throw new Error(
        `Steps: items[${index}] must be {label: string, description?: string}`,
      );
    }
  });
  return items as StepItem[];
};
