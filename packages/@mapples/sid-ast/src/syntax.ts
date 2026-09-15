// Syntax errors in a TSX file — the gate before extraction. TypeScript's
// parser recovers from almost anything and still yields a tree, so a
// half-typed tag would extract as a real element. Callers that turn a file
// into a document refuse it while it does not parse. Pure: string in, JSON out,
// and browser-safe: no compiler host, no `process`.

import ts from 'typescript';

export interface SyntaxProblem {
  message: string;
  /** 1-based. */
  line: number;
  /** 1-based. */
  column: number;
}

/** The parse errors of a TSX file, in source order — empty when it parses. */
export function findSyntaxErrors(source: string): SyntaxProblem[] {
  const sf = ts.createSourceFile(
    'file.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  // reason: the parser fills `parseDiagnostics` but the public typings omit it;
  // `transpileModule` exposes them publicly yet reads `process` and throws in a browser.
  const diagnostics = (
    sf as unknown as { parseDiagnostics?: readonly ts.DiagnosticWithLocation[] }
  ).parseDiagnostics;
  if (!Array.isArray(diagnostics)) {
    throw new Error(
      'typescript no longer exposes parse diagnostics on a SourceFile — update @mapples/sid-ast',
    );
  }
  return diagnostics.map((d) => {
    const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
    return {
      message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
      line: line + 1,
      column: character + 1,
    };
  });
}
