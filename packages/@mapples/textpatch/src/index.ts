/** A Source update's `text` directive (RFC-0001 A13). */
export interface TextDirective {
  /** `textHash` of the text the hunks were computed against. */
  base: string;
  /** Unified-diff hunk section turning that text into the new one. */
  hunks: string;
}

export { joinLines, splitLines } from './lines.js';
export type { SplitText } from './lines.js';
export {
  applyHunks,
  countLines,
  makeHunks,
  mapAddedLines,
  NO_EOL,
  parseHunks,
  TextPatchError,
} from './hunks.js';
export type { Hunk } from './hunks.js';
export { merge3 } from './merge.js';
export type { Merge3Result } from './merge.js';
export { textHash } from './hash.js';
