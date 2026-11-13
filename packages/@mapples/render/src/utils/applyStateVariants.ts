import { AnyObject } from '../types';

/**
 * States an element is in because of how the user touches it, not because of
 * data. A `styled` key can name one after `::` (`style::$pressed`), exactly
 * like a condition state; the value is the selector the style runtime
 * (Reanimated's pseudo-selector values) switches on.
 */
export const INTERACTION_STATES = {
  $pressed: ':active',
  $hovered: ':hover',
  $focused: ':focus',
} as const;

/** `$pressed`, `$hovered` or `$focused`. */
export type InteractionState = keyof typeof INTERACTION_STATES;

/** Whether a state name is an interaction state rather than a condition's key. */
export const isInteractionState = (state: string): state is InteractionState =>
  Object.hasOwn(INTERACTION_STATES, state);

/** One style object out of a style, an array of styles, or nothing. */
const flattenLayers = (style: unknown): AnyObject => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenLayers));
  }
  return typeof style === 'object' && style !== null
    ? (style as AnyObject)
    : {};
};

/**
 * `styled` with its `key::state` variants applied. A slot with an active
 * variant becomes `[base, ...activeVariants]` (every active variant, in the
 * order they are written); a slot without one is its base exactly as written
 * — never wrapped in an array — so components receive the shape the author
 * gave. Variant keys never reach the component.
 *
 * An interaction state (`style::$pressed`, see {@link INTERACTION_STATES})
 * that `isActive` does not force on is not decided here: the element itself
 * knows when it is pressed. Its variant is appended to the slot as one more
 * layer whose values are selector values, `{ default: <resting value>,
 * ':active': <pressed value> }`, which the style runtime applies while the
 * touch lasts. Forced on (the canvas showing the state), it is an ordinary
 * active variant.
 *
 * @param styled - A node's `styled` prop
 * @param isActive - Whether the state named after `::` holds
 */
export const applyStateVariants = (
  styled: AnyObject,
  isActive: (state: string) => boolean,
): AnyObject => {
  const out: AnyObject = {};
  const active: Record<string, unknown[]> = {};
  const interactive: Record<string, [string, unknown][]> = {};

  for (const key of Object.keys(styled)) {
    const [base, state] = key.split('::') as [string, string | undefined];
    if (state === undefined) {
      out[key] = styled[key];
    } else if (isActive(state)) {
      (active[base] ??= []).push(styled[key]);
    } else if (isInteractionState(state)) {
      (interactive[base] ??= []).push([INTERACTION_STATES[state], styled[key]]);
    }
  }

  for (const [base, variants] of Object.entries(active)) {
    out[base] = [styled[base], ...variants];
  }

  for (const [base, variants] of Object.entries(interactive)) {
    const resting = flattenLayers(out[base]);
    const layer: AnyObject = {};
    for (const [selector, variant] of variants) {
      for (const [prop, value] of Object.entries(flattenLayers(variant))) {
        layer[prop] = {
          ...(layer[prop] ??
            (prop in resting ? { default: resting[prop] } : {})),
          [selector]: value,
        };
      }
    }
    out[base] = [...(active[base] ? out[base] : [out[base]]), layer];
  }

  return out;
};
