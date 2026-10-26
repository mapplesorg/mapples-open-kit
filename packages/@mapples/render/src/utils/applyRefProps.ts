import { AnyObject } from '../types';

/**
 * `props` with an element's resolved asset refs applied. A key without a dot
 * (`source`) replaces that prop; a dotted key is a path into a prop's data
 * (`items.0.thumbnail`: the thumbnail of the first list item), set on copies
 * of the arrays and objects along it so the author's data is never mutated.
 * A path whose item is not there (the list is shorter, or still loading)
 * sets nothing — the ref waits for its item rather than inventing one.
 *
 * @param props - The element's merged props (literals, bound data)
 * @param refs - Resolved values per `refProps` key
 */
export const applyRefProps = (
  props: AnyObject,
  refs: Record<string, unknown>,
): AnyObject => {
  let out = props;
  for (const [key, value] of Object.entries(refs)) {
    out = setPath(out, key.split('.'), value) ?? out;
  }
  return out;
};

/** `container` with `value` at `path`, copied along it; null when the path is not there. */
const setPath = (
  container: AnyObject | unknown[],
  path: string[],
  value: unknown,
): AnyObject | unknown[] | null => {
  const [head, ...rest] = path as [string, ...string[]];
  const copy: AnyObject | unknown[] = Array.isArray(container)
    ? [...container]
    : { ...container };
  if (
    Array.isArray(copy) &&
    !(/^\d+$/.test(head) && Number(head) < copy.length)
  ) {
    return null;
  }
  const slot = copy as Record<string, unknown>;
  if (rest.length === 0) {
    slot[head] = value;
    return copy;
  }
  const child = slot[head];
  if (typeof child !== 'object' || child === null) return null;
  const next = setPath(child as AnyObject | unknown[], rest, value);
  if (next === null) return null;
  slot[head] = next;
  return copy;
};
