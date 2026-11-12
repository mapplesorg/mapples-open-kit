// TSX -> RenderDom. Every element with $sid becomes a node; everything else —
// non-$sid JSX, hooks, handlers, all non-JSX code — is invisible.

import { analyze, type RootCause } from './parse.js';
import type { ExtractOptions, ExtractResult, Span } from './types.js';

export function extract(
  source: string,
  options: ExtractOptions = {},
): ExtractResult {
  const analysis = analyze(source, options);
  const spans = new Map<string, Span>();
  for (const [sid, info] of analysis.info) spans.set(sid, info.span);
  const states: ExtractResult['states'] = {};
  for (const [key, state] of analysis.states) {
    states[key] = { name: state.name, condition: state.condition };
  }
  // The document holds one root; every further `$sid` tree is dropped, so
  // say where it is instead of losing it silently.
  const extraRoots = analysis.roots.slice(1).map((root) => {
    const info = analysis.info.get(root.sid);
    const line = info
      ? source.slice(0, info.span.start).split('\n').length
      : undefined;
    const element = `<${info?.tagName ?? root.type}>${line ? ` (line ${line})` : ''}`;
    return {
      kind: 'MULTIPLE_ROOTS' as const,
      sid: root.sid,
      detail: `${element} ${rootCauseText(analysis.rootCauses.get(root.sid))}`,
    };
  });
  return {
    dom: analysis.roots[0] ?? null,
    warnings: [...analysis.warnings, ...extraRoots],
    spans,
    states,
  };
}

const ONE_TREE =
  "Return a single tree: put the branches under one root and switch with a prop condition (`{variant === 'brand' ? <A /> : <B />}`).";

/** The sentence after the element in a MULTIPLE_ROOTS warning: what is wrong, then what to do. */
export function rootCauseText(cause: RootCause | undefined): string {
  switch (cause?.kind) {
    case 'return':
      return `is in another \`return\` — the canvas holds one tree per file and reads the first. ${ONE_TREE}`;
    case 'helper':
      return 'is JSX in a helper function or a variable, outside the tree the component returns — the canvas reads that tree only. Write it inside the returned tree, or move the helper into a component file of its own.';
    case 'fragment':
      return "sits next to the first root inside a fragment (`<>…</>`) — the canvas holds one root element per file. Wrap the fragment's children in one element, e.g. a <View>.";
    case 'conditional':
      return `is the other branch of a conditional around the root — the canvas holds one root element per file. ${ONE_TREE}`;
    case 'parent':
      return `is inside <${cause.parentTag}> (line ${cause.parentLine}), which the canvas does not read as an element, so it has no parent in the tree. Use an element the canvas reads there, or move <${cause.parentTag}> inside the tree.`;
    default:
      return `is a second root element — the canvas holds one tree per file and does not read this one or anything inside it. ${ONE_TREE}`;
  }
}
