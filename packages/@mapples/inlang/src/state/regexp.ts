/**
 * Regular expression used to split a condition string on the `::` separator,
 * ignoring any `::` sequences that appear inside double-quoted substrings.
 *
 * This lookahead-based pattern ensures that quoted values (e.g. `"foo::bar"`)
 * are treated as atomic tokens rather than split mid-value.
 */
export const ConditionStringRegExp = /::(?=(?:[^"]*"[^"]*")*[^"]*$)/;
