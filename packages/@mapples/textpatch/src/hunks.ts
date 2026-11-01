/**
 * Unified-diff hunks (RFC-0001 A13). Format, emitted by every generator and
 * accepted by every parser:
 *
 *     @@ -A,B +C,D @@
 *      context
 *     -removed
 *     +added
 *     \ No newline at end of file
 *
 * The marker follows the last line of a side that lacks a trailing newline;
 * lines are joined with "\n" and the string ends with "\n"; hunks are
 * ascending and non-overlapping. An empty file has zero lines:
 * `@@ -0,0 +1,N @@` fills one, `@@ -1,N +0,0 @@` empties one. The parser also
 * accepts the short `-A +C` header form (count 1).
 *
 * Apply is exact: every context and removed line must equal the old line at
 * the cursor, header counts must match, and the no-newline markers must agree
 * with the old text. Any violation is `SOURCE_PATCH_INVALID`. The rules are
 * mirrored line for line by the server's `api/canvas/textpatch.py`.
 */

import { diffLines } from 'diff';

import { joinLines, splitLines } from './lines.js';

export const NO_EOL = '\\ No newline at end of file';
const HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@$/;

export class TextPatchError extends Error {
  readonly code = 'SOURCE_PATCH_INVALID';

  constructor(message: string) {
    super(message);
    this.name = 'TextPatchError';
  }
}

export interface Hunk {
  oldStart: number;
  oldLen: number;
  newStart: number;
  newLen: number;
  /** Each with its prefix: " ", "-", "+" or the no-newline marker. */
  lines: string[];
}

type Tag = 'equal' | 'delete' | 'insert';

interface Opcode {
  tag: Tag;
  i1: number;
  i2: number;
  j1: number;
  j2: number;
}

const lineCount = (value: string): number => splitLines(value).lines.length;

/** difflib-shaped opcodes over line indexes, computed by jsdiff's line diff. */
const opcodes = (oldText: string, newText: string): Opcode[] => {
  const codes: Opcode[] = [];
  let i = 0;
  let j = 0;
  for (const part of diffLines(oldText, newText)) {
    const n = lineCount(part.value);
    if (n === 0) continue;
    if (part.added) {
      codes.push({ tag: 'insert', i1: i, i2: i, j1: j, j2: j + n });
      j += n;
    } else if (part.removed) {
      codes.push({ tag: 'delete', i1: i, i2: i + n, j1: j, j2: j });
      i += n;
    } else {
      codes.push({ tag: 'equal', i1: i, i2: i + n, j1: j, j2: j + n });
      i += n;
      j += n;
    }
  }
  return codes;
};

/** Port of difflib's `get_grouped_opcodes`: hunks with `n` lines of context. */
const groupOpcodes = (input: Opcode[], n: number): Opcode[][] => {
  const codes = input.map((code) => ({ ...code }));
  const first = codes[0];
  if (first.tag === 'equal') {
    codes[0] = {
      ...first,
      i1: Math.max(first.i1, first.i2 - n),
      j1: Math.max(first.j1, first.j2 - n),
    };
  }
  const last = codes[codes.length - 1];
  if (last.tag === 'equal') {
    codes[codes.length - 1] = {
      ...last,
      i2: Math.min(last.i2, last.i1 + n),
      j2: Math.min(last.j2, last.j1 + n),
    };
  }
  const nn = n + n;
  const groups: Opcode[][] = [];
  let group: Opcode[] = [];
  for (const code of codes) {
    let { i1, j1 } = code;
    const { tag, i2, j2 } = code;
    if (tag === 'equal' && i2 - i1 > nn) {
      group.push({
        tag,
        i1,
        i2: Math.min(i2, i1 + n),
        j1,
        j2: Math.min(j2, j1 + n),
      });
      groups.push(group);
      group = [];
      i1 = Math.max(i1, i2 - n);
      j1 = Math.max(j1, j2 - n);
    }
    group.push({ tag, i1, i2, j1, j2 });
  }
  if (group.length > 0 && !(group.length === 1 && group[0].tag === 'equal')) {
    groups.push(group);
  }
  return groups;
};

/** The hunks turning `oldText` into `newText`; `''` when they are equal. */
export const makeHunks = (
  oldText: string,
  newText: string,
  options: { context?: number } = {},
): string => {
  if (oldText === newText) return '';
  const context = options.context ?? 3;
  const old = splitLines(oldText);
  const next = splitLines(newText);
  const out: string[] = [];
  for (const group of groupOpcodes(opcodes(oldText, newText), context)) {
    const i1 = group[0].i1;
    const i2 = group[group.length - 1].i2;
    const j1 = group[0].j1;
    const j2 = group[group.length - 1].j2;
    const oldLen = i2 - i1;
    const newLen = j2 - j1;
    out.push(
      `@@ -${oldLen > 0 ? i1 + 1 : i1},${oldLen} +${newLen > 0 ? j1 + 1 : j1},${newLen} @@`,
    );
    for (const code of group) {
      if (code.tag === 'equal' || code.tag === 'delete') {
        const prefix = code.tag === 'equal' ? ' ' : '-';
        for (let i = code.i1; i < code.i2; i += 1) {
          out.push(prefix + old.lines[i]);
          if (i === old.lines.length - 1 && !old.eol) out.push(NO_EOL);
        }
      } else {
        for (let j = code.j1; j < code.j2; j += 1) {
          out.push(`+${next.lines[j]}`);
          if (j === next.lines.length - 1 && !next.eol) out.push(NO_EOL);
        }
      }
    }
  }
  return `${out.join('\n')}\n`;
};

export const parseHunks = (hunks: string): Hunk[] => {
  if (hunks === '' || !hunks.endsWith('\n')) {
    throw new TextPatchError(
      'hunks must be a non-empty string ending with a newline',
    );
  }
  const raw = hunks.split('\n');
  raw.pop(); // the terminator
  const parsed: Hunk[] = [];
  let i = 0;
  while (i < raw.length) {
    const match = HEADER_RE.exec(raw[i]);
    if (match === null) {
      throw new TextPatchError(`expected a hunk header at line ${i + 1}`);
    }
    const oldStart = Number(match[1]);
    const oldLen = match[2] !== undefined ? Number(match[2]) : 1;
    const newStart = Number(match[3]);
    const newLen = match[4] !== undefined ? Number(match[4]) : 1;
    if ((oldLen > 0 && oldStart === 0) || (newLen > 0 && newStart === 0)) {
      throw new TextPatchError(`hunk header at line ${i + 1} starts at line 0`);
    }
    i += 1;
    const lines: string[] = [];
    let seenOld = 0;
    let seenNew = 0;
    while (i < raw.length) {
      const line = raw[i];
      if (line.startsWith('\\')) {
        if (line !== NO_EOL) {
          throw new TextPatchError(`unknown marker at line ${i + 1}`);
        }
        if (lines.length === 0 || lines[lines.length - 1] === NO_EOL) {
          throw new TextPatchError(`marker without a line at line ${i + 1}`);
        }
        lines.push(line);
        i += 1;
        continue;
      }
      if (seenOld === oldLen && seenNew === newLen) break;
      const prefix = line.slice(0, 1);
      if (prefix === ' ') {
        seenOld += 1;
        seenNew += 1;
      } else if (prefix === '-') {
        seenOld += 1;
      } else if (prefix === '+') {
        seenNew += 1;
      } else {
        throw new TextPatchError(`unknown line prefix at line ${i + 1}`);
      }
      if (seenOld > oldLen || seenNew > newLen) {
        throw new TextPatchError(
          `hunk body exceeds its header counts at line ${i + 1}`,
        );
      }
      lines.push(line);
      i += 1;
    }
    if (seenOld !== oldLen || seenNew !== newLen) {
      throw new TextPatchError('hunk body is shorter than its header counts');
    }
    parsed.push({ oldStart, oldLen, newStart, newLen, lines });
  }
  return parsed;
};

/** Apply `hunks` to `oldText` exactly; `TextPatchError` on any mismatch. */
export const applyHunks = (oldText: string, hunks: string): string => {
  const parsed = parseHunks(hunks);
  const old = splitLines(oldText);
  const out: string[] = [];
  let cursor = 0;
  /** `out.length` when a +/context line was marked no-EOL: nothing may follow. */
  let markedLen: number | null = null;
  for (const hunk of parsed) {
    const start = hunk.oldLen > 0 ? hunk.oldStart - 1 : hunk.oldStart;
    if (start < cursor || start > old.lines.length) {
      throw new TextPatchError('hunk out of order or past the end of the text');
    }
    if (markedLen !== null) {
      throw new TextPatchError('lines follow a no-newline marker');
    }
    out.push(...old.lines.slice(cursor, start));
    cursor = start;
    const expectedNew = hunk.newLen > 0 ? hunk.newStart - 1 : hunk.newStart;
    if (out.length !== expectedNew) {
      throw new TextPatchError('hunk new-side line number does not match');
    }
    let prev: { kind: string; oldIndex: number | null } | null = null;
    let needMarker = false;
    for (const line of hunk.lines) {
      if (line === NO_EOL) {
        if (prev === null) throw new TextPatchError('marker without a line');
        if (
          (prev.kind === ' ' || prev.kind === '-') &&
          (prev.oldIndex !== old.lines.length - 1 || old.eol)
        ) {
          throw new TextPatchError(
            'no-newline marker does not match the old text',
          );
        }
        if (prev.kind === ' ' || prev.kind === '+') markedLen = out.length;
        needMarker = false;
        prev = null;
        continue;
      }
      if (needMarker) {
        throw new TextPatchError(
          'old text has no trailing newline but the hunk claims one',
        );
      }
      if (markedLen !== null) {
        throw new TextPatchError('lines follow a no-newline marker');
      }
      const prefix = line[0];
      const body = line.slice(1);
      if (prefix === ' ' || prefix === '-') {
        if (cursor >= old.lines.length || old.lines[cursor] !== body) {
          throw new TextPatchError(`hunk does not apply at line ${cursor + 1}`);
        }
        if (prefix === ' ') out.push(body);
        prev = { kind: prefix, oldIndex: cursor };
        needMarker = cursor === old.lines.length - 1 && !old.eol;
        cursor += 1;
      } else {
        out.push(body);
        prev = { kind: '+', oldIndex: null };
      }
    }
    if (needMarker) {
      throw new TextPatchError(
        'old text has no trailing newline but the hunk claims one',
      );
    }
  }
  const tail = old.lines.slice(cursor);
  if (tail.length > 0 && markedLen !== null) {
    throw new TextPatchError('lines follow a no-newline marker');
  }
  out.push(...tail);
  let newEol: boolean;
  if (markedLen !== null) newEol = false;
  else if (tail.length > 0) newEol = old.eol;
  else newEol = true;
  return joinLines(out, newEol);
};

/** `{ added, removed }` line counts of a hunks string. */
export const countLines = (
  hunks: string,
): { added: number; removed: number } => {
  let added = 0;
  let removed = 0;
  for (const hunk of parseHunks(hunks)) {
    for (const line of hunk.lines) {
      if (line === NO_EOL) continue;
      if (line[0] === '+') added += 1;
      else if (line[0] === '-') removed += 1;
    }
  }
  return { added, removed };
};

/** Rewrite the body of every `+` line (cid resolution lives there). */
export const mapAddedLines = (
  hunks: string,
  fn: (line: string) => string,
): string => {
  const out: string[] = [];
  for (const hunk of parseHunks(hunks)) {
    out.push(
      `@@ -${hunk.oldStart},${hunk.oldLen} +${hunk.newStart},${hunk.newLen} @@`,
    );
    for (const line of hunk.lines) {
      if (line !== NO_EOL && line[0] === '+') out.push(`+${fn(line.slice(1))}`);
      else out.push(line);
    }
  }
  return `${out.join('\n')}\n`;
};
