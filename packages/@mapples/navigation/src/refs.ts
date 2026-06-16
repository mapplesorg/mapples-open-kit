/**
 * Parsing for the shared `ref(assetType:uuid:name)` grammar (same grammar as
 * `@mapples/render`'s `RefPropsMap`). Used to resolve `ref(theme:…)` colours and
 * `ref(icon:…)` icons at render time.
 */

export interface ParsedRef {
  type: string;
  uuid: string;
  name: string;
}

const REF_PATTERN = /^ref\(([^:]+):([^:]+):(.+)\)$/;

/** Parse a `ref(type:uuid:name)` string, or `null` if it isn't one. */
export const parseRef = (value?: string): ParsedRef | null => {
  if (!value) return null;
  const match = REF_PATTERN.exec(value);
  if (!match) return null;
  return { type: match[1], uuid: match[2], name: match[3] };
};

/** Whether a value is a `ref(...)` string (of `type`, if given). */
export const isRef = (value?: string, type?: string): boolean => {
  const parsed = parseRef(value);
  return !!parsed && (!type || parsed.type === type);
};
