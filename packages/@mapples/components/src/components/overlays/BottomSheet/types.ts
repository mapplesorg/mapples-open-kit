import { BUTTON_VARIANTS, ButtonVariant } from '@mapples/ui';

/** One button of the sheet's footer bar. */
export interface BottomSheetFooterAction {
  /** Visible text. */
  label: string;
  /** The value `onFooterActionPress` reports. */
  value: string;
  /** Button variant; defaults to `filled` for the last action, `outlined` before it. */
  variant?: ButtonVariant;
}

/** Most buttons the footer bar shows. */
export const BOTTOM_SHEET_MAX_FOOTER_ACTIONS = 2;

/** `true` when `value` is a well-formed footer action. */
export const isBottomSheetFooterAction = (
  value: unknown,
): value is BottomSheetFooterAction =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as BottomSheetFooterAction).label === 'string' &&
  typeof (value as BottomSheetFooterAction).value === 'string' &&
  ((value as BottomSheetFooterAction).variant === undefined ||
    BUTTON_VARIANTS.includes(
      (value as BottomSheetFooterAction).variant as ButtonVariant,
    ));

/**
 * The footer buttons a sheet renders. A malformed entry or too many buttons
 * is a data error — it is reported, never silently trimmed.
 */
export const readBottomSheetFooterActions = (
  actions: unknown,
): BottomSheetFooterAction[] => {
  if (actions === undefined || actions === null) return [];
  if (!Array.isArray(actions)) {
    throw new Error(
      'BottomSheet: footerActions must be an array of {label, value, variant?}',
    );
  }
  if (actions.length > BOTTOM_SHEET_MAX_FOOTER_ACTIONS) {
    throw new Error(
      `BottomSheet: at most ${BOTTOM_SHEET_MAX_FOOTER_ACTIONS} footerActions are allowed (got ${actions.length})`,
    );
  }
  actions.forEach((action, index) => {
    if (!isBottomSheetFooterAction(action)) {
      throw new Error(
        `BottomSheet: footerActions[${index}] must be {label: string, value: string, variant?: ${BUTTON_VARIANTS.join(' | ')}}`,
      );
    }
  });
  return actions as BottomSheetFooterAction[];
};

/**
 * The sheet heights, in points, of `snapPoints` against the screen height:
 * a value in (0, 1] is a fraction of the screen, a value above 1 is points.
 * `undefined`/`null` means no snap points (a content-sized sheet). An empty
 * list, a non-positive or non-finite value, or heights that do not strictly
 * ascend are authoring errors — reported, never repaired.
 */
export const resolveSnapHeights = (
  snapPoints: unknown,
  screenHeight: number,
): number[] | undefined => {
  if (snapPoints === undefined || snapPoints === null) return undefined;
  if (!Array.isArray(snapPoints) || snapPoints.length === 0) {
    throw new Error(
      'BottomSheet: snapPoints must be a non-empty array of numbers — points (> 1) or screen fractions (0–1], e.g. [120, 0.5, 0.9]',
    );
  }
  const heights = snapPoints.map((point, index) => {
    if (typeof point !== 'number' || !Number.isFinite(point) || point <= 0) {
      throw new Error(
        `BottomSheet: snapPoints[${index}] must be a positive number — points (> 1) or a screen fraction (0–1] (got ${String(point)})`,
      );
    }
    return point <= 1 ? point * screenHeight : point;
  });
  heights.forEach((height, index) => {
    if (index > 0 && height <= heights[index - 1]) {
      throw new Error(
        `BottomSheet: snapPoints must ascend (snapPoints[${index}] resolves to ${Math.round(height)} pt, not above ${Math.round(heights[index - 1])} pt)`,
      );
    }
  });
  return heights;
};

/** The starting snap index; anything but an index of `heights` is an error. */
export const readSnapIndex = (index: unknown, heights: number[]): number => {
  if (
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= heights.length
  ) {
    throw new Error(
      `BottomSheet: defaultSnapIndex must be an integer from 0 to ${heights.length - 1} (got ${String(index)})`,
    );
  }
  return index;
};
