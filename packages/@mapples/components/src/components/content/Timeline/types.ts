/** Marker styles. */
export const TIMELINE_VARIANTS = ['dot', 'icon'] as const;
export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];

/** Progress state of one event. */
export const TIMELINE_STATUSES = ['done', 'current', 'upcoming'] as const;
export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];

/** One event of a {@link Timeline}. */
export interface TimelineItem {
  /** Event text. */
  title: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** When it happened, aligned to the end ('09:30', 'Mar 3'). */
  time?: string;
  /** Overrides the state derived from `activeIndex`. */
  status?: TimelineStatus;
  /** Glyph inside the marker with `variant: 'icon'` (project icon family). */
  iconName?: string;
}

/** Marker geometry per variant. */
export const TIMELINE_GEOMETRY = {
  dot: {
    /** Width of the rail column. */
    rail: 20,
    /** Edge of the marker box the dot centres in. */
    marker: 20,
    /** Edge of a done/upcoming dot. */
    dot: 12,
    /** Edge of the current dot including its ring. */
    ring: 18,
    /** Extra top padding of the texts so the first line centres on the marker. */
    textTop: 0,
  },
  icon: {
    rail: 28,
    marker: 28,
    dot: 28,
    ring: 28,
    textTop: 3,
  },
} as const;

/** Line thickness of the connectors. */
export const TIMELINE_LINE = 2;

/** The state an event renders in. */
export const timelineStatusOf = (
  item: TimelineItem,
  index: number,
  activeIndex: number | undefined,
): TimelineStatus => {
  if (item.status) return item.status;
  if (activeIndex === undefined) return 'done';
  return index < activeIndex
    ? 'done'
    : index === activeIndex
      ? 'current'
      : 'upcoming';
};

/**
 * The events a timeline renders. A malformed entry is a data error — it is
 * reported, never silently skipped, so an author sees which item is wrong.
 */
export const readTimelineItems = (
  items: unknown,
  component: string,
): TimelineItem[] => {
  if (items === undefined || items === null) return [];
  if (!Array.isArray(items)) {
    throw new Error(
      `${component}: items must be an array of {title, subtitle?, time?, status?, iconName?}`,
    );
  }
  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `${component}: items[${index}] must be {title: string, subtitle?, time?, status?, iconName?}`,
      );
    }
    const { title, subtitle, time, status, iconName } = item as TimelineItem;
    if (typeof title !== 'string') {
      throw new Error(`${component}: items[${index}].title must be a string`);
    }
    for (const [key, value] of Object.entries({ subtitle, time, iconName })) {
      if (value !== undefined && typeof value !== 'string') {
        throw new Error(
          `${component}: items[${index}].${key} must be a string`,
        );
      }
    }
    if (status !== undefined && !TIMELINE_STATUSES.includes(status)) {
      throw new Error(
        `${component}: items[${index}].status must be one of ${TIMELINE_STATUSES.join(', ')}`,
      );
    }
  });
  return items as TimelineItem[];
};
