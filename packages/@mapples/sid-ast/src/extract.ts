// TSX -> RenderDom. Every element with $sid becomes a node; everything else —
// non-$sid JSX, hooks, handlers, all non-JSX code — is invisible.

import { analyze } from './parse.js';
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
    return {
      kind: 'MULTIPLE_ROOTS' as const,
      sid: root.sid,
      detail: `<${info?.tagName ?? root.type}>${line ? ` (line ${line})` : ''} is a second root element — the canvas holds one tree per file and does not read this one or anything inside it. Return a single tree: put the branches under one root and switch with a prop condition (\`{variant === 'brand' ? <A /> : <B />}\`) instead of several returns or helper functions.`,
    };
  });
  return {
    dom: analysis.roots[0] ?? null,
    warnings: [...analysis.warnings, ...extraRoots],
    spans,
    states,
  };
}
