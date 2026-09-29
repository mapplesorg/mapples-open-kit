/**
 * Line rule (RFC-0001 A13, normative): split on "\n" only. "\r", "\f" and
 * " " are content, so CRLF files round-trip byte-exact. The server's
 * Python twin uses `text.split("\n")` for the same reason — never
 * `splitlines()`.
 */

export interface SplitText {
  /** Lines without their "\n". */
  lines: string[];
  /** Whether the text ends with a newline. Empty text is zero lines, `true`. */
  eol: boolean;
}

export const splitLines = (text: string): SplitText => {
  if (text === '') return { lines: [], eol: true };
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
    return { lines, eol: true };
  }
  return { lines, eol: false };
};

export const joinLines = (lines: string[], eol: boolean): string => {
  if (lines.length === 0) return '';
  return lines.join('\n') + (eol ? '\n' : '');
};
