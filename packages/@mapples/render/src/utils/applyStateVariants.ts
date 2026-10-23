import { AnyObject } from '../types';

/**
 * `styled` with its `key::state` variants applied. A slot with an active
 * variant becomes `[base, ...activeVariants]` (every active variant, in the
 * order they are written); a slot without one is its base exactly as written
 * — never wrapped in an array — so components receive the shape the author
 * gave. Variant keys never reach the component.
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

  for (const key of Object.keys(styled)) {
    const [base, state] = key.split('::') as [string, string | undefined];
    if (state === undefined) {
      out[key] = styled[key];
    } else if (isActive(state)) {
      (active[base] ??= []).push(styled[key]);
    }
  }

  for (const [base, variants] of Object.entries(active)) {
    out[base] = [styled[base], ...variants];
  }

  return out;
};
