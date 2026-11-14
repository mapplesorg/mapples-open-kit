// Data states in a file. A style variant under a prop state is code
// (`[styles.card, isActive && styles.cardActive]`); a variant under any other
// document state stays a `'style::<key>'` entry, and the element says what
// that state is in `$states` — the way `$data` carries a `_visible` condition
// on the data state:
//
//   <View
//     $sid="nd_1"
//     $states={{ high: { condition: 'vars.count::gt::3', name: 'High' } }}
//     styled={{ style: styles.counter, 'style::high': styles.counterHigh }}
//   />
//
// The running app evaluates the condition (`MapplesElement`), the canvas
// reads it back as the document's state. Pure: JSON in, JSON out.

import { propTestCode } from './propConditions.js';
import type { RenderDomNode, RenderState } from './types.js';

/** The JSX attribute an element declares its data states in. */
export const STATES_ATTR = '$states';

/**
 * `$pressed`, `$hovered`, `$focused`: states the element is in because of
 * how it is touched. They have no condition, so nothing declares them.
 */
const isInteractionState = (stateKey: string): boolean =>
  stateKey.startsWith('$');

/** The `styled` record a node's style lives in — `layout.styled` for a Custom. */
export function styledOf(
  node: RenderDomNode,
): Record<string, unknown> | undefined {
  const holder =
    node.type === 'Custom'
      ? (node.props.layout as Record<string, unknown> | undefined)
      : node.props;
  const styled = holder?.styled;
  return typeof styled === 'object' && styled !== null && !Array.isArray(styled)
    ? (styled as Record<string, unknown>)
    : undefined;
}

/**
 * The states a node declares in `$states`: every document state one of its
 * `key::state` style variants renders under, except the ones that print as
 * code (a prop test), the interaction states, and a state the Creator has
 * no condition for yet (it never holds). Undefined when there is none.
 */
export function elementStates(
  node: RenderDomNode,
  states: Record<string, RenderState> | undefined,
): Record<string, RenderState> | undefined {
  const styled = styledOf(node);
  if (!styled || !states) return undefined;
  const out: Record<string, RenderState> = {};
  for (const [slot, value] of Object.entries(styled)) {
    if (value === undefined) continue;
    const stateKey = slot.split('::')[1];
    if (stateKey === undefined || isInteractionState(stateKey)) continue;
    const state = states[stateKey];
    if (state === undefined || state.condition === '') continue;
    if (propTestCode(state.condition) !== null) continue;
    out[stateKey] = { condition: state.condition, name: state.name };
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * A `$states` literal as states, or null when it is not one: an object of
 * `{ condition, name? }` by state key. A state written without a name is
 * named by its key.
 */
export function readStates(value: unknown): Record<string, RenderState> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return null;
  const out: Record<string, RenderState> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry))
      return null;
    const { condition, name, ...rest } = entry as Record<string, unknown>;
    if (typeof condition !== 'string' || condition === '') return null;
    if (name !== undefined && typeof name !== 'string') return null;
    if (Object.keys(rest).length > 0) return null;
    out[key] = { condition, name: name ?? key };
  }
  return out;
}
