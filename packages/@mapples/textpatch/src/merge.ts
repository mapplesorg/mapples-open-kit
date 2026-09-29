/**
 * Line-level 3-way merge for Source text: base (the text both sides started
 * from), ours, theirs. Regions of the base that only one side changed take
 * that side; a region both sides changed merges only when both made the
 * same change, otherwise it is a conflict — reported, never written as
 * markers (the callers decide what a conflict means for them). As in git,
 * two changes that touch without an unchanged line between them conflict.
 *
 * Built on jsdiff's array diff (browser-safe under every bundler); the
 * region walk is the classic diff3 algorithm.
 */

import { diffArrays } from 'diff';

export type Merge3Result =
  | { ok: true; text: string }
  | { ok: false; conflicts: number };

/** One changed region: base lines [baseStart, baseEnd) became side lines [sideStart, sideEnd). */
interface SideHunk {
  baseStart: number;
  baseEnd: number;
  sideStart: number;
  sideEnd: number;
}

const hunksOf = (base: string[], side: string[]): SideHunk[] => {
  const hunks: SideHunk[] = [];
  let baseAt = 0;
  let sideAt = 0;
  let open: SideHunk | null = null;
  for (const part of diffArrays(base, side)) {
    const count = part.value.length;
    if (part.added || part.removed) {
      if (open === null) {
        open = {
          baseStart: baseAt,
          baseEnd: baseAt,
          sideStart: sideAt,
          sideEnd: sideAt,
        };
        hunks.push(open);
      }
      if (part.removed) {
        baseAt += count;
        open.baseEnd = baseAt;
      } else {
        sideAt += count;
        open.sideEnd = sideAt;
      }
    } else {
      open = null;
      baseAt += count;
      sideAt += count;
    }
  }
  return hunks;
};

/**
 * The side's line index that corresponds to a base index at a region edge.
 * A pure insert is a zero-length base hunk sitting exactly on an index: at a
 * region's start it belongs to the region (not counted), at its end it does
 * (counted) — that is what makes the side slice cover the insert.
 */
const sideIndexAt = (
  hunks: SideHunk[],
  baseIndex: number,
  edge: 'start' | 'end',
): number => {
  let shift = 0;
  for (const hunk of hunks) {
    const before =
      edge === 'end'
        ? hunk.baseEnd <= baseIndex
        : hunk.baseEnd < baseIndex ||
          (hunk.baseEnd === baseIndex && hunk.baseStart < baseIndex);
    if (!before) break;
    shift += hunk.sideEnd - hunk.sideStart - (hunk.baseEnd - hunk.baseStart);
  }
  return baseIndex + shift;
};

const sameLines = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((line, at) => line === b[at]);

export const merge3 = (
  base: string,
  ours: string,
  theirs: string,
): Merge3Result => {
  if (ours === theirs) return { ok: true, text: ours };
  if (ours === base) return { ok: true, text: theirs };
  if (theirs === base) return { ok: true, text: ours };
  // A trailing "\n" leaves a final '' element, so the newline state merges
  // like any other line.
  const baseLines = base.split('\n');
  const oursLines = ours.split('\n');
  const theirsLines = theirs.split('\n');
  const oursHunks = hunksOf(baseLines, oursLines);
  const theirsHunks = hunksOf(baseLines, theirsLines);

  const out: string[] = [];
  let conflicts = 0;
  let baseAt = 0;
  let oi = 0;
  let ti = 0;
  while (oi < oursHunks.length || ti < theirsHunks.length) {
    const nextOurs = oursHunks[oi];
    const nextTheirs = theirsHunks[ti];
    const first =
      nextOurs === undefined
        ? nextTheirs
        : nextTheirs === undefined
          ? nextOurs
          : nextOurs.baseStart <= nextTheirs.baseStart
            ? nextOurs
            : nextTheirs;
    let start = first.baseStart;
    let end = first.baseEnd;
    let usedOurs = false;
    let usedTheirs = false;
    // Grow the region while a hunk of either side touches it.
    for (;;) {
      let grew = false;
      while (oi < oursHunks.length && oursHunks[oi].baseStart <= end) {
        end = Math.max(end, oursHunks[oi].baseEnd);
        start = Math.min(start, oursHunks[oi].baseStart);
        usedOurs = true;
        oi += 1;
        grew = true;
      }
      while (ti < theirsHunks.length && theirsHunks[ti].baseStart <= end) {
        end = Math.max(end, theirsHunks[ti].baseEnd);
        start = Math.min(start, theirsHunks[ti].baseStart);
        usedTheirs = true;
        ti += 1;
        grew = true;
      }
      if (!grew) break;
    }
    out.push(...baseLines.slice(baseAt, start));
    const oursRegion = oursLines.slice(
      sideIndexAt(oursHunks, start, 'start'),
      sideIndexAt(oursHunks, end, 'end'),
    );
    const theirsRegion = theirsLines.slice(
      sideIndexAt(theirsHunks, start, 'start'),
      sideIndexAt(theirsHunks, end, 'end'),
    );
    if (usedOurs && usedTheirs) {
      if (sameLines(oursRegion, theirsRegion)) out.push(...oursRegion);
      else conflicts += 1;
    } else if (usedOurs) {
      out.push(...oursRegion);
    } else {
      out.push(...theirsRegion);
    }
    baseAt = end;
  }
  out.push(...baseLines.slice(baseAt));
  if (conflicts > 0) return { ok: false, conflicts };
  return { ok: true, text: out.join('\n') };
};
