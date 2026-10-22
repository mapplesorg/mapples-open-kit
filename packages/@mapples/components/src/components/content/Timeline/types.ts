/** Marker styles. */
export const TIMELINE_VARIANTS = ['dot', 'icon'] as const;
export type TimelineVariant = (typeof TIMELINE_VARIANTS)[number];

/** Progress state of one event. */
export const TIMELINE_STATUSES = ['done', 'current', 'upcoming'] as const;
export type TimelineStatus = (typeof TIMELINE_STATUSES)[number];

/** What an item draws: an event on the rail, or a transit leg between two. */
export const TIMELINE_ITEM_KINDS = ['stop', 'leg'] as const;
export type TimelineItemKind = (typeof TIMELINE_ITEM_KINDS)[number];

/** Where the time sits: after the title, or in a fixed column before the rail. */
export const TIMELINE_TIME_PLACEMENTS = ['end', 'leading'] as const;
export type TimelineTimePlacement = (typeof TIMELINE_TIME_PLACEMENTS)[number];

/** One event of a {@link Timeline}. */
export interface TimelineItem {
  /**
   * `stop` (default) is an event with a marker; `leg` is a transit leg drawn
   * as a dashed connector with a pill of `iconName` + `title`
   * ("Walk · 14 min") — only `title`, `iconName` and `status` apply to it.
   */
  kind?: TimelineItemKind;
  /** Event text (the pill text of a leg). */
  title: string;
  /** Supporting text under the title. */
  subtitle?: string;
  /** When it happened, aligned to the end ('09:30', 'Mar 3'). */
  time?: string;
  /** Overrides the state derived from `activeIndex`. */
  status?: TimelineStatus;
  /** Small status text next to the title ("DONE", "NOW"), coloured by status. */
  statusLabel?: string;
  /**
   * Glyph inside the marker with `variant: 'icon'`, or in a leg's pill
   * (project icon family).
   */
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
    /** Check glyph of a done marker when `doneTone` is set. */
    check: 12,
  },
  icon: {
    rail: 28,
    marker: 28,
    dot: 28,
    ring: 28,
    textTop: 3,
    check: 16,
  },
} as const;

/** Line thickness of the connectors. */
export const TIMELINE_LINE = 2;

/** Width of the time column with `timePlacement: 'leading'`, in points. */
export const TIMELINE_TIME_WIDTH = 56;

/** Glyph size in a leg's pill. */
export const TIMELINE_LEG_ICON = 14;

/**
 * Whether the connector from `statuses[index]` to the next item counts as
 * travelled: this item is done and the next one is reached (done or current).
 */
export const timelineTravelled = (
  statuses: readonly TimelineStatus[],
  index: number,
): boolean => {
  const next = statuses[index + 1];
  return (
    statuses[index] === 'done' && next !== undefined && next !== 'upcoming'
  );
};

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
      `${component}: items must be an array of {kind?, title, subtitle?, time?, status?, statusLabel?, iconName?}`,
    );
  }
  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(
        `${component}: items[${index}] must be {kind?, title: string, subtitle?, time?, status?, statusLabel?, iconName?}`,
      );
    }
    const { kind, title, subtitle, time, status, statusLabel, iconName } =
      item as TimelineItem;
    if (kind !== undefined && !TIMELINE_ITEM_KINDS.includes(kind)) {
      throw new Error(
        `${component}: items[${index}].kind must be one of ${TIMELINE_ITEM_KINDS.join(', ')}`,
      );
    }
    if (typeof title !== 'string') {
      throw new Error(`${component}: items[${index}].title must be a string`);
    }
    for (const [key, value] of Object.entries({
      subtitle,
      time,
      statusLabel,
      iconName,
    })) {
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
