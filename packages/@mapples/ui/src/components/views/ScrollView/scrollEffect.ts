/**
 * A scroll-linked effect on the items of a scroll view (a coverflow shelf):
 * the item at the centre of the viewport is drawn at its `scale`, facing
 * forward; an item one `itemSize` away is at the `side*` values, and items in
 * between are interpolated from the scroll offset. The scroll view snaps item
 * by item, pads its content so the first and last item can reach the centre,
 * and opens on `initialItem`.
 *
 * Plain data, so it is written as a literal prop and edited in the Creator.
 *
 * @public
 */
export interface ScrollEffect {
  /** Length of one item along the scroll axis, in points; also the snap interval. */
  itemSize: number;
  /** Zero-based index of the item the scroll view opens on. Defaults to `0`. */
  initialItem?: number;
  /** Scale of the item at the centre. Defaults to `1`. */
  scale?: number;
  /** Scale of an item one item away. Defaults to `scale`. */
  sideScale?: number;
  /** Turn of an item one item away, in degrees about the axis across the scroll. Defaults to `0`. */
  sideRotate?: number;
  /** Opacity of an item one item away. Defaults to `1`. */
  sideOpacity?: number;
  /** Shift of an item one item away across the scroll axis, in points. Defaults to `0`. */
  sideTranslate?: number;
  /** Perspective of the turn, in points. Defaults to `600`. */
  perspective?: number;
  /** Transform origin of each item (`'50% 120px'`). Defaults to the item's centre. */
  origin?: string;
}

/** What one item looks like at a scroll offset. */
export interface ScrollEffectItem {
  opacity: number;
  zIndex: number;
  scale: number;
  /** Degrees. */
  rotate: number;
  translate: number;
  perspective: number;
}

const DEFAULT_PERSPECTIVE = 600;

/** The effect when it can run: a positive `itemSize`. */
export const usableScrollEffect = (
  effect: ScrollEffect | undefined,
): ScrollEffect | undefined =>
  effect && effect.itemSize > 0 ? effect : undefined;

/** The scroll offset that puts `initialItem` at the centre. */
export const scrollEffectStart = (effect: ScrollEffect): number =>
  Math.max(0, Math.floor(effect.initialItem ?? 0)) * effect.itemSize;

/** Padding before the first and after the last item, so each can reach the centre. */
export const scrollEffectInset = (
  effect: ScrollEffect,
  viewport: number,
): number => Math.max(0, (viewport - effect.itemSize) / 2);

/**
 * The look of item `index` when the scroll view stands at `offset`.
 * `distance` runs from -1 (one item after the centre) to 1 (one item
 * before); everything further away keeps the side values.
 */
export const scrollEffectItem = (
  effect: ScrollEffect,
  index: number,
  offset: number,
): ScrollEffectItem => {
  const distance = Math.max(
    -1,
    Math.min(1, (offset - index * effect.itemSize) / effect.itemSize),
  );
  const away = Math.abs(distance);
  const scale = effect.scale ?? 1;
  const mix = (centre: number, side: number) => centre + (side - centre) * away;

  return {
    opacity: mix(1, effect.sideOpacity ?? 1),
    zIndex: away < 0.5 ? 2 : 1,
    scale: mix(scale, effect.sideScale ?? scale),
    rotate: (effect.sideRotate ?? 0) * distance,
    translate: (effect.sideTranslate ?? 0) * away,
    perspective: effect.perspective ?? DEFAULT_PERSPECTIVE,
  };
};
