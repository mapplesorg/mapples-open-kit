/**
 * Regex to split condition strings on `::` while respecting quoted segments.
 * Used so values like `"a::b"` are not split on the inner `::`.
 * @public
 */
export const ConditionStringRegExp = /::(?=(?:[^"]*"[^"]*")*[^"]*$)/;
