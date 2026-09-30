// Surgical patching: apply RenderDom-level edits to TSX source, reprinting ONLY
// the affected $sid regions. All user text outside them is preserved
// byte-for-byte. Edits are applied one at a time, re-analyzing in between, so
// spans never go stale.

import { deepEqual } from './equal.js';
import { analyze, type Analysis, type ElementInfo } from './parse.js';
import {
  emittable,
  printAttr,
  printAttrsText,
  printChild,
  printElement,
  printValue,
  visibilityGuard,
} from './print.js';
import { propTestCode } from './propConditions.js';
import type {
  ExtractWarning,
  PatchOptions,
  PatchResult,
  RenderDomNode,
  SidEdit,
} from './types.js';

function sq(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function splice(
  source: string,
  start: number,
  end: number,
  replacement: string,
): string {
  return source.slice(0, start) + replacement + source.slice(end);
}

function indentAt(source: string, offset: number): string {
  const lineStart = source.lastIndexOf('\n', offset - 1) + 1;
  const match = /^[ \t]*/.exec(source.slice(lineStart, offset));
  return match ? match[0] : '';
}

function requireInfo(analysis: Analysis, sid: string): ElementInfo {
  const info = analysis.info.get(sid);
  if (!info) throw new Error(`patch target ${sid} not found in source`);
  return info;
}

function applySetProps(
  source: string,
  analysis: Analysis,
  edit: Extract<SidEdit, { kind: 'setProps' }>,
  warnings: ExtractWarning[],
  options: PatchOptions,
): string {
  const print = { states: options.states };
  const info = requireInfo(analysis, edit.sid);
  // Among JSX children a prop-test `_visible` is the element's guard, not a
  // `$data` entry; `applyGuard` writes it after the attributes.
  const guarded = info.jsxChild || info.guard !== null;
  const current = analysis.nodes.get(edit.sid)!;
  const desired: RenderDomNode = {
    sid: edit.sid,
    type: edit.type ?? current.type,
    props: edit.props,
    children: current.children,
    ...(edit.refProps && Object.keys(edit.refProps).length > 0
      ? { refProps: edit.refProps }
      : {}),
    ...(edit.dataProps && Object.keys(edit.dataProps).length > 0
      ? { dataProps: edit.dataProps }
      : {}),
    ...(edit.actionProps && Object.keys(edit.actionProps).length > 0
      ? { actionProps: edit.actionProps }
      : {}),
  };

  if (edit.type !== undefined && edit.type !== current.type) {
    // A re-typed node cannot be patched attribute-wise: reprint the shell,
    // carrying the user's non-literal attributes over verbatim and keeping the
    // inner region untouched.
    const { elementName } = emittable({ ...desired, children: [] }, guarded);
    const preserved = info.attrs
      .filter((a) => !a.literal)
      .map((a) => ' ' + a.raw)
      .join('');
    if (info.selfClosing || info.innerSpan === null) {
      const replacement = `<${elementName}${printAttrsText(desired, print, guarded)}${preserved} />`;
      return applyGuard(
        splice(source, info.span.start, info.span.end, replacement),
        edit.sid,
        visibilityGuard(desired),
        warnings,
      );
    }
    const inner = source.slice(info.innerSpan.start, info.innerSpan.end);
    const replacement = `<${elementName}${printAttrsText(desired, print, guarded)}${preserved}>${inner}</${elementName}>`;
    return applyGuard(
      splice(source, info.span.start, info.span.end, replacement),
      edit.sid,
      visibilityGuard(desired),
      warnings,
    );
  }

  // 1. Attributes — surgical, one at a time. User expression props (non-literal
  //    attrs) are never touched; only canvas-owned literal attrs are rewritten.
  const { attrs: desiredList } = emittable(
    { ...desired, children: [] },
    guarded,
  );
  const desiredMap = new Map(
    desiredList.filter(([n]) => n !== '$sid').map(([n, v]) => [n, v]),
  );
  const textEdits: { start: number; end: number; replacement: string }[] = [];
  for (const attr of info.attrs) {
    if (!attr.literal || attr.name === '$sid') continue;
    if (desiredMap.has(attr.name)) {
      const value = desiredMap.get(attr.name);
      desiredMap.delete(attr.name);
      if (!deepEqual(attr.value, value)) {
        // A value read through `styles.card` references: write the change
        // into the dictionary entry and keep the reference, where the entry
        // is this element's alone.
        const kept = new Map<string, string>();
        for (const ref of attr.styleRefs ?? []) {
          const sub = valueAt(value, ref.path);
          if (sub === undefined) continue; // that part of the value is gone: the reference goes with it
          const expr = `${ref.dict}.${ref.key}`;
          if (deepEqual(valueAt(attr.value, ref.path), sub)) {
            kept.set(ref.path.join('.'), expr);
            continue;
          }
          const span = analysis.styleEntrySpan(ref.dict, ref.key);
          if (!span) continue;
          if (analysis.styleRefCount(ref.dict, ref.key) > 1) {
            warnings.push({
              kind: 'NON_LITERAL_PROP',
              sid: edit.sid,
              prop: attr.name,
              detail: `\`${expr}\` is shared by other elements; the Creator's change to <${info.tagName}> was written inline instead`,
            });
            continue;
          }
          textEdits.push({
            start: span.start,
            end: span.end,
            replacement: printValue(sub),
          });
          kept.set(ref.path.join('.'), expr);
        }
        const exprAt =
          kept.size > 0
            ? (path: string[]) => kept.get(path.join('.'))
            : undefined;
        textEdits.push({
          start: attr.span.start,
          end: attr.span.end,
          replacement: printAttr(attr.name, value, exprAt, options.states),
        });
      }
    } else {
      // Canvas prop removed remotely: delete the attribute and its leading whitespace.
      let start = attr.span.start;
      while (
        start > 0 &&
        (source[start - 1] === ' ' ||
          source[start - 1] === '\n' ||
          source[start - 1] === '\t')
      ) {
        start -= 1;
      }
      textEdits.push({ start, end: attr.span.end, replacement: '' });
    }
  }
  if (desiredMap.size > 0) {
    // Never add an attribute that would shadow a user expression prop of the
    // same name — the user's expression wins in the file; the canvas value
    // stays in base (NON_LITERAL_PROP discipline).
    const nonLiteralNames = new Set(
      info.attrs.filter((a) => !a.literal).map((a) => a.name),
    );
    const additions: string[] = [];
    for (const [n, v] of desiredMap) {
      if (nonLiteralNames.has(n)) {
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid: edit.sid,
          prop: n,
          detail: `\`${n}\` on <${info.tagName}> is set in code, so the Creator's value for it was not written to the file`,
        });
        continue;
      }
      additions.push(' ' + printAttr(n, v, undefined, options.states));
    }
    if (additions.length > 0) {
      // Right after the last attribute, not at the end of the attribute
      // region: that region runs up to `/>` and so includes the space before
      // it — appending there printed `…}  $data={…}/>`.
      const insertAt = info.attrs.reduce(
        (end, attr) => Math.max(end, attr.span.end),
        info.attrsSpan.start,
      );
      textEdits.push({
        start: insertAt,
        end: insertAt,
        replacement: additions.join(''),
      });
    }
  }
  textEdits.sort((a, b) => b.start - a.start);
  let out = source;
  for (const te of textEdits)
    out = splice(out, te.start, te.end, te.replacement);

  // 2. Text children (only when the node has no $sid children).
  const { text } = emittable(desired);
  const currentText =
    typeof current.props.children === 'string' ? current.props.children : null;
  if (text !== currentText && info.childSids.length === 0) {
    // Re-analyze: offsets shifted after the attribute splice.
    const re = analyze(out);
    const reInfo = requireInfo(re, edit.sid);
    if (reInfo.innerSpan) {
      out = splice(
        out,
        reInfo.innerSpan.start,
        reInfo.innerSpan.end,
        text === null ? '' : `{${sq(text)}}`,
      );
    } else if (text !== null) {
      // Self-closing element gaining text: rewrite `<X … />` -> `<X …>{'text'}</X>`.
      const shell = printElement(
        { ...desired, children: [] },
        '',
        print,
        guarded,
      );
      out = splice(out, reInfo.span.start, reInfo.span.end, shell);
    }
  } else if (text !== currentText && info.childSids.length > 0) {
    warnings.push({
      kind: 'NON_LITERAL_PROP',
      sid: edit.sid,
      prop: 'children',
      detail: `<${info.tagName}> has child elements, so the Creator's text change was not written to the file`,
    });
  }
  return applyGuard(out, edit.sid, visibilityGuard(desired), warnings);
}

/**
 * Make the element render under `condition` (a prop test) or under none:
 * wraps it as `{test && (<X/>)}`, rewrites or drops an `&&` guard. A ternary
 * branch is the developer's structure — a changed test there is reported,
 * not written. Only a direct JSX child can take a new guard.
 */
function applyGuard(
  source: string,
  sid: string,
  condition: string | null,
  warnings: ExtractWarning[],
): string {
  const info = requireInfo(analyze(source), sid);
  if ((info.guard?.condition ?? null) === condition) return source;
  const element = source.slice(info.span.start, info.span.end);
  if (info.guard?.kind === 'ternary') {
    warnings.push({
      kind: 'NON_LITERAL_PROP',
      sid,
      prop: '_visible',
      detail: `<${info.tagName}> is a branch of a conditional in the file; the Creator's visibility change was not written`,
    });
    return source;
  }
  const test = condition === null ? null : propTestCode(condition);
  const wrapped = test === null ? element : `{${test} && (${element})}`;
  if (info.guard) {
    return splice(source, info.guard.span.start, info.guard.span.end, wrapped);
  }
  if (!info.jsxChild) {
    warnings.push({
      kind: 'NON_LITERAL_PROP',
      sid,
      prop: '_visible',
      detail: `<${info.tagName}> is not a JSX child; its prop-test visibility stays in the Creator only`,
    });
    return source;
  }
  return splice(source, info.span.start, info.span.end, wrapped);
}

/** The value at a path inside a JSON value, or undefined when the path is not there. */
function valueAt(value: unknown, path: string[]): unknown {
  let cur: unknown = value;
  for (const key of path) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function applyRemove(source: string, analysis: Analysis, sid: string): string {
  const info = requireInfo(analysis, sid);
  // Swallow the whitespace-only prefix on the element's own line.
  let start = info.span.start;
  const lineStart = source.lastIndexOf('\n', start - 1) + 1;
  if (/^[ \t]*$/.test(source.slice(lineStart, start))) start = lineStart;
  return splice(source, start, info.span.end, '');
}

function childAnchor(
  source: string,
  info: ElementInfo,
  analysis: Analysis,
  at: number,
): number {
  const childInfos = info.childSids.map((s) => requireInfo(analysis, s));
  if (at < childInfos.length) {
    const target = childInfos[at]!;
    const lineStart = source.lastIndexOf('\n', target.span.start - 1) + 1;
    return /^[ \t]*$/.test(source.slice(lineStart, target.span.start))
      ? lineStart
      : target.span.start;
  }
  if (info.innerSpan === null)
    throw new Error(`cannot append into self-closing element ${info.sid}`);
  const closeStart = info.innerSpan.end;
  const lineStart = source.lastIndexOf('\n', closeStart - 1) + 1;
  return /^[ \t]*$/.test(source.slice(lineStart, closeStart))
    ? lineStart
    : closeStart;
}

function applyInsert(
  source: string,
  analysis: Analysis,
  edit: Extract<SidEdit, { kind: 'insertChild' }>,
  options: PatchOptions,
): string {
  let info = requireInfo(analysis, edit.parentSid);
  let out = source;
  if (info.innerSpan === null) {
    // Convert `<X … />` to `<X …>\n</X>` first, then re-analyze.
    const indent = indentAt(out, info.span.start);
    const withoutSelfClose = out
      .slice(info.span.start, info.span.end)
      .replace(/\s*\/>$/, '>');
    out = splice(
      out,
      info.span.start,
      info.span.end,
      `${withoutSelfClose}\n${indent}</${info.tagName}>`,
    );
    const re = analyze(out);
    info = requireInfo(re, edit.parentSid);
    analysis = re;
  }
  const anchor = childAnchor(
    out,
    info,
    analysis,
    Math.max(0, Math.min(edit.at, info.childSids.length)),
  );
  const indent = indentAt(out, info.span.start) + '  ';
  return splice(
    out,
    anchor,
    anchor,
    printChild(edit.node, indent, { states: options.states }) + '\n',
  );
}

function applyMove(
  source: string,
  analysis: Analysis,
  edit: Extract<SidEdit, { kind: 'moveChild' }>,
  warnings: ExtractWarning[],
): string {
  const parentInfo = requireInfo(analysis, edit.parentSid);
  const from = parentInfo.childSids.indexOf(edit.sid);
  if (from === -1) {
    warnings.push({
      kind: 'NON_LITERAL_PROP',
      sid: edit.sid,
      detail: `the Creator's move of $sid="${edit.sid}" was not written: the file doesn't have it inside $sid="${edit.parentSid}"`,
    });
    return source;
  }
  const childInfo = requireInfo(analysis, edit.sid);
  // Cut the child's line-extended span…
  let cutStart = childInfo.span.start;
  const lineStart = source.lastIndexOf('\n', cutStart - 1) + 1;
  if (/^[ \t]*$/.test(source.slice(lineStart, cutStart))) cutStart = lineStart;
  let cutEnd = childInfo.span.end;
  if (source[cutEnd] === '\n') cutEnd += 1;
  const chunk = source.slice(cutStart, cutEnd);
  const removed = splice(source, cutStart, cutEnd, '');

  // …then re-anchor among the remaining children.
  const re = analyze(removed);
  const reParent = requireInfo(re, edit.parentSid);
  const to = Math.max(0, Math.min(edit.to, reParent.childSids.length));
  const anchor = childAnchor(removed, reParent, re, to);
  return splice(
    removed,
    anchor,
    anchor,
    chunk.endsWith('\n') ? chunk : chunk + '\n',
  );
}

export function patch(
  source: string,
  edits: SidEdit[],
  options: PatchOptions = {},
): PatchResult {
  const warnings: ExtractWarning[] = [];
  let out = source;
  for (const edit of edits) {
    const analysis = analyze(out, options);
    switch (edit.kind) {
      case 'setProps':
        out = applySetProps(out, analysis, edit, warnings, options);
        break;
      case 'removeNode':
        out = applyRemove(out, analysis, edit.sid);
        break;
      case 'insertChild':
        out = applyInsert(out, analysis, edit, options);
        break;
      case 'moveChild':
        out = applyMove(out, analysis, edit, warnings);
        break;
      case 'replaceSubtree': {
        const info = requireInfo(analysis, edit.sid);
        const indent = indentAt(out, info.span.start);
        out = splice(
          out,
          info.span.start,
          info.span.end,
          printElement(
            edit.node,
            indent,
            { states: options.states },
            info.jsxChild || info.guard !== null,
          ).trimStart(),
        );
        out = applyGuard(
          out,
          edit.node.sid,
          visibilityGuard(edit.node),
          warnings,
        );
        break;
      }
    }
  }
  return { source: out, warnings };
}
