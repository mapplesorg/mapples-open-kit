/** Title placement and bar height. */
export const TOP_APP_BAR_VARIANTS = ['small', 'center', 'large'] as const;
export type TopAppBarVariant = (typeof TOP_APP_BAR_VARIANTS)[number];

/** One trailing action of the bar. */
export interface TopAppBarAction {
  /** Glyph from the project icon family. */
  iconName: string;
  /** The value `onActionPress` reports. */
  value: string;
  /** Accessibility label of the glyph button; defaults to `value`. */
  label?: string;
}

/** Most actions a bar shows. */
export const TOP_APP_BAR_MAX_ACTIONS = 3;

/** Height of the bar row (small/center) and of each of the large bar's rows. */
export const TOP_APP_BAR_ROW_HEIGHT = 56;

/** Total height of the large bar. */
export const TOP_APP_BAR_LARGE_HEIGHT = 112;

/** Edge of a glyph button (the 44 pt touch target). */
export const TOP_APP_BAR_BUTTON_SIZE = 44;

/** Glyph size inside a button. */
export const TOP_APP_BAR_GLYPH_SIZE = 24;

/** `true` when `value` is a well-formed action. */
export const isTopAppBarAction = (value: unknown): value is TopAppBarAction =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as TopAppBarAction).iconName === 'string' &&
  typeof (value as TopAppBarAction).value === 'string' &&
  ((value as TopAppBarAction).label === undefined ||
    typeof (value as TopAppBarAction).label === 'string');

/**
 * The actions a bar renders. A malformed entry or too many actions is a data
 * error — it is reported, never silently trimmed, so an author sees what to
 * fix.
 */
export const readTopAppBarActions = (actions: unknown): TopAppBarAction[] => {
  if (actions === undefined || actions === null) return [];
  if (!Array.isArray(actions)) {
    throw new Error(
      'TopAppBar: actions must be an array of {iconName, value, label?}',
    );
  }
  if (actions.length > TOP_APP_BAR_MAX_ACTIONS) {
    throw new Error(
      `TopAppBar: at most ${TOP_APP_BAR_MAX_ACTIONS} actions are allowed (got ${actions.length})`,
    );
  }
  actions.forEach((action, index) => {
    if (!isTopAppBarAction(action)) {
      throw new Error(
        `TopAppBar: actions[${index}] must be {iconName: string, value: string, label?: string}`,
      );
    }
  });
  return actions as TopAppBarAction[];
};
