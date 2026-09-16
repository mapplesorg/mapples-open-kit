// TSX -> RenderDom. Every element with $sid becomes a node; everything else —
// non-$sid JSX, hooks, handlers, all non-JSX code — is invisible.

import { analyze } from './parse';
import type { ExtractOptions, ExtractResult, Span } from './types';

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
  return {
    dom: analysis.roots[0] ?? null,
    warnings: analysis.warnings,
    spans,
    states,
  };
}
