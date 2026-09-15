// Surgical patching: apply RenderDom-level edits to TSX source, reprinting ONLY
// the affected $sid regions. All user text outside them is preserved
// byte-for-byte. Edits are applied one at a time, re-analyzing in between, so
// spans never go stale.

import { deepEqual } from './equal';
import { analyze, type Analysis, type ElementInfo } from './parse';
import {
  emittable,
  printAttr,
  printAttrsText,
  printNode,
  printValue,
} from './print';
import type {
  ExtractOptions,
  ExtractWarning,
  PatchResult,
  RenderDomNode,
  SidEdit,
} from './types';

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
): string {
  const info = requireInfo(analysis, edit.sid);
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
    const { elementName } = emittable({ ...desired, children: [] });
    const preserved = info.attrs
      .filter((a) => !a.literal)
      .map((a) => ' ' + a.raw)
      .join('');
    if (info.selfClosing || info.innerSpan === null) {
      const replacement = `<${elementName}${printAttrsText(desired)}${preserved} />`;
      return splice(source, info.span.start, info.span.end, replacement);
    }
    const inner = source.slice(info.innerSpan.start, info.innerSpan.end);
    const replacement = `<${elementName}${printAttrsText(desired)}${preserved}>${inner}</${elementName}>`;
    return splice(source, info.span.start, info.span.end, replacement);
  }

  // 1. Attributes — surgical, one at a time. User expression props (non-literal
  //    attrs) are never touched; only canvas-owned literal attrs are rewritten.
  const { attrs: desiredList } = emittable({ ...desired, children: [] });
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
          replacement: printAttr(attr.name, value, exprAt),
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
          detail: `prop \`${n}\` is a user expression in the file; canvas value not applied`,
        });
        continue;
      }
      additions.push(' ' + printAttr(n, v));
    }
    if (additions.length > 0) {
      textEdits.push({
        start: info.attrsSpan.end,
        end: info.attrsSpan.end,
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
      const shell = printNode({ ...desired, children: [] }, '');
      out = splice(out, reInfo.span.start, reInfo.span.end, shell);
    }
  } else if (text !== currentText && info.childSids.length > 0) {
    warnings.push({
      kind: 'NON_LITERAL_PROP',
      sid: edit.sid,
      prop: 'children',
      detail: 'text change skipped: node has element children',
    });
  }
  return out;
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
  return splice(out, anchor, anchor, printNode(edit.node, indent) + '\n');
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
      detail: `move skipped: ${edit.sid} is not a child of ${edit.parentSid}`,
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
  _options: ExtractOptions = {},
): PatchResult {
  const warnings: ExtractWarning[] = [];
  let out = source;
  for (const edit of edits) {
    const analysis = analyze(out, _options);
    switch (edit.kind) {
      case 'setProps':
        out = applySetProps(out, analysis, edit, warnings);
        break;
      case 'removeNode':
        out = applyRemove(out, analysis, edit.sid);
        break;
      case 'insertChild':
        out = applyInsert(out, analysis, edit);
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
          printNode(edit.node, indent).trimStart(),
        );
        break;
      }
    }
  }
  return { source: out, warnings };
}
