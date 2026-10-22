/** Title placement and bar height. */
export const TOP_APP_BAR_VARIANTS = ['small', 'center', 'large'] as const;
export type TopAppBarVariant = (typeof TOP_APP_BAR_VARIANTS)[number];

/**
 * One trailing action of the bar: a glyph button (`iconName`) or a text
 * button (`label` without `iconName`, e.g. 'Clear queue').
 */
export interface TopAppBarAction {
  /** Glyph from the project icon family; omit for a text action that shows `label`. */
  iconName?: string;
  /** The value `onActionPress` reports. */
  value: string;
  /** Text of a text action; with `iconName`, the glyph button's accessibility label (defaults to `value`). */
  label?: string;
  /** Count pinned to the glyph button's corner; hidden at 0. Glyph actions only. */
  badgeCount?: number;
  /** Toggle state of a glyph action ('favourite'); set, the button reports its state to screen readers. */
  selected?: boolean;
  /** Glyph shown while `selected` ('heart'). Glyph actions only. */
  selectedIconName?: string;
  /** Dims the action and ignores presses. */
  disabled?: boolean;
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

/** Size of the trailing avatar (32 pt) inside its 44 pt touch target. */
export const TOP_APP_BAR_AVATAR_SIZE = 'sm' as const;

const isOptional = (value: unknown, type: 'string' | 'number' | 'boolean') =>
  value === undefined || typeof value === type;

/** `true` when `value` is a well-formed action (one of `iconName` / `label` set). */
export const isTopAppBarAction = (value: unknown): value is TopAppBarAction => {
  if (typeof value !== 'object' || value === null) return false;
  const action = value as Record<string, unknown>;
  return (
    typeof action.value === 'string' &&
    isOptional(action.iconName, 'string') &&
    isOptional(action.label, 'string') &&
    (!!action.iconName || !!action.label) &&
    isOptional(action.badgeCount, 'number') &&
    isOptional(action.selected, 'boolean') &&
    isOptional(action.selectedIconName, 'string') &&
    isOptional(action.disabled, 'boolean')
  );
};

const ACTION_SHAPE =
  '{value: string, iconName?: string, label?: string, badgeCount?: number, selected?: boolean, selectedIconName?: string, disabled?: boolean} with iconName or label';

/**
 * The actions a bar renders. A malformed entry or too many actions is a data
 * error — it is reported, never silently trimmed, so an author sees what to
 * fix.
 */
export const readTopAppBarActions = (actions: unknown): TopAppBarAction[] => {
  if (actions === undefined || actions === null) return [];
  if (!Array.isArray(actions)) {
    throw new Error(`TopAppBar: actions must be an array of ${ACTION_SHAPE}`);
  }
  if (actions.length > TOP_APP_BAR_MAX_ACTIONS) {
    throw new Error(
      `TopAppBar: at most ${TOP_APP_BAR_MAX_ACTIONS} actions are allowed (got ${actions.length})`,
    );
  }
  actions.forEach((action, index) => {
    if (!isTopAppBarAction(action)) {
      throw new Error(`TopAppBar: actions[${index}] must be ${ACTION_SHAPE}`);
    }
    const { iconName, label, badgeCount, selected, selectedIconName } = action;
    if (
      !iconName &&
      (badgeCount !== undefined ||
        selected !== undefined ||
        selectedIconName !== undefined)
    ) {
      throw new Error(
        `TopAppBar: actions[${index}] ('${label}') is a text action; badgeCount, selected and selectedIconName need an iconName`,
      );
    }
  });
  return actions as TopAppBarAction[];
};
