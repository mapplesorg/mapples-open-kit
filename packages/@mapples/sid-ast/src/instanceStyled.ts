// A component's instance styling in code. The canvas renders an instance as
// a `StyledView` carrying the instance's `styled` around the component's
// root; a component file does the same — it takes `styled` in its props and
// returns `<View styled={styled}>` around its `$sid` root. That wrapper is
// code, not a canvas element: extraction ignores it (no `$sid`) and the
// adopt codemod never tags it (`isInstanceWrapper`).

import ts from 'typescript';

import { upsertImports } from './imports.js';

/** The prop member a component's props type declares for instance styling. */
export const INSTANCE_STYLED_MEMBER =
  'styled?: StyledProps<Partial<ViewProps>>;';

/** The type imports that member reads. */
export const INSTANCE_STYLED_TYPE_IMPORTS: { module: string; name: string }[] =
  [
    { module: '@mapples/style', name: 'StyledProps' },
    { module: 'react-native', name: 'ViewProps' },
  ];

function parse(source: string): ts.SourceFile {
  return ts.createSourceFile(
    'f.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}

function defaultFunction(sf: ts.SourceFile): ts.FunctionDeclaration | null {
  for (const stmt of sf.statements) {
    if (!ts.isFunctionDeclaration(stmt)) continue;
    const kinds = (stmt.modifiers ?? []).map((m) => m.kind);
    if (
      kinds.includes(ts.SyntaxKind.ExportKeyword) &&
      kinds.includes(ts.SyntaxKind.DefaultKeyword)
    ) {
      return stmt;
    }
  }
  return null;
}

/** The JSX the function's body returns at its top level, parentheses unwrapped. */
function returnedJsx(
  fn: ts.FunctionDeclaration,
): ts.JsxElement | ts.JsxSelfClosingElement | null {
  const statements = fn.body?.statements ?? [];
  for (let i = statements.length - 1; i >= 0; i -= 1) {
    const stmt = statements[i]!;
    if (!ts.isReturnStatement(stmt) || !stmt.expression) continue;
    let expr: ts.Expression = stmt.expression;
    while (ts.isParenthesizedExpression(expr)) expr = expr.expression;
    return ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)
      ? expr
      : null;
  }
  return null;
}

/** `<View styled={styled}>` — one attribute, exactly that. */
function isWrapperShape(node: ts.Node): node is ts.JsxElement {
  if (!ts.isJsxElement(node)) return false;
  const open = node.openingElement;
  if (!ts.isIdentifier(open.tagName) || open.tagName.text !== 'View') {
    return false;
  }
  const attrs = open.attributes.properties;
  if (attrs.length !== 1) return false;
  const attr = attrs[0]!;
  if (
    !ts.isJsxAttribute(attr) ||
    !ts.isIdentifier(attr.name) ||
    attr.name.text !== 'styled'
  ) {
    return false;
  }
  const init = attr.initializer;
  return (
    init !== undefined &&
    ts.isJsxExpression(init) &&
    init.expression !== undefined &&
    ts.isIdentifier(init.expression) &&
    init.expression.text === 'styled'
  );
}

/**
 * Whether `node` is the instance wrapper of the file's component: the
 * `<View styled={styled}>` its default export returns.
 */
export function isInstanceWrapper(node: ts.Node, sf: ts.SourceFile): boolean {
  if (!isWrapperShape(node)) return false;
  const fn = defaultFunction(sf);
  return fn !== null && returnedJsx(fn) === node;
}

export interface InstanceStyledResult {
  source: string;
  /** Why the file was left as it is, when its shape is not one this handles. */
  note: string | null;
}

/** Local names bound by the file's imports, with the module each comes from. */
function importBindings(sf: ts.SourceFile): Map<string, string> {
  const bound = new Map<string, string>();
  for (const stmt of sf.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier)
    )
      continue;
    const clause = stmt.importClause;
    if (!clause) continue;
    const module = stmt.moduleSpecifier.text;
    if (clause.name) bound.set(clause.name.text, module);
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const el of clause.namedBindings.elements) {
        bound.set(el.name.text, module);
      }
    }
  }
  return bound;
}

/** Offsets inside multi-line template literals: re-indenting there changes the string. */
function templateRanges(node: ts.Node): [number, number][] {
  const ranges: [number, number][] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
      ranges.push([n.getStart(), n.getEnd()]);
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return ranges;
}

/**
 * Make the file's component take instance styling: `styled` in its props
 * (destructured, declared on its props type) and `<View styled={styled}>`
 * around the root it returns, with the imports those need. A file already
 * carrying both comes back unchanged; a component written in a shape this
 * does not rewrite (props not destructured, an intersection props type…)
 * comes back unchanged with a `note` saying what to add by hand.
 */
export function ensureInstanceStyled(source: string): InstanceStyledResult {
  const sf = parse(source);
  const unchanged = (note: string | null): InstanceStyledResult => ({
    source,
    note,
  });
  const fn = defaultFunction(sf);
  const jsx = fn ? returnedJsx(fn) : null;
  if (!fn?.name || !jsx) {
    return unchanged(
      'the component has no `export default function` returning JSX, so instance styling (`styled`) was not added — take a `styled` prop and pass it to a View around the root',
    );
  }
  const bound = importBindings(sf);
  const edits: { start: number; end: number; replacement: string }[] = [];
  let needsMemberImports = false;

  // ---- the props: `styled` destructured and declared ----
  const byHand = (why: string): InstanceStyledResult =>
    unchanged(
      `${why}, so instance styling was not added — destructure \`styled\` and declare \`${INSTANCE_STYLED_MEMBER}\``,
    );
  const typeDecls = new Map<
    string,
    ts.InterfaceDeclaration | ts.TypeAliasDeclaration
  >();
  for (const stmt of sf.statements) {
    if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) {
      typeDecls.set(stmt.name.text, stmt);
    }
  }
  const hasStyledMember = (members: ts.NodeArray<ts.TypeElement>): boolean =>
    members.some(
      (m) =>
        m.name !== undefined &&
        (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name)) &&
        m.name.text === 'styled',
    );
  /** Declare the member on a members list closing at `closeBrace`. */
  const declareOn = (
    members: ts.NodeArray<ts.TypeElement>,
    closeBrace: number,
  ): void => {
    if (hasStyledMember(members)) return;
    needsMemberImports = true;
    const lineStart = source.lastIndexOf('\n', closeBrace - 1) + 1;
    const before = source.slice(lineStart, closeBrace);
    if (/^\s*$/.test(before)) {
      // `}` on its own line: the member goes on the line above it.
      edits.push({
        start: lineStart,
        end: lineStart,
        replacement: `${before}  ${INSTANCE_STYLED_MEMBER}\n`,
      });
      return;
    }
    // `{ a: string }` on one line.
    const last = before.trimEnd().slice(-1);
    const separator = last === '{' || last === ';' || last === ',' ? '' : ';';
    const at = lineStart + before.trimEnd().length;
    edits.push({
      start: at,
      end: at,
      replacement: `${separator} ${INSTANCE_STYLED_MEMBER} `,
    });
  };

  const propsTypeName = `${fn.name.text}Props`;
  const params = fn.parameters;
  if (params.length > 1)
    return byHand('the component takes more than one parameter');
  const param = params[0];
  if (param === undefined) {
    if (typeDecls.has(propsTypeName)) {
      return byHand(
        `\`${propsTypeName}\` exists but the component takes no props`,
      );
    }
    edits.push({
      start: params.pos,
      end: params.end,
      replacement: `{ styled }: ${propsTypeName}`,
    });
    edits.push({
      start: fn.getStart(sf),
      end: fn.getStart(sf),
      replacement: `export interface ${propsTypeName} {\n  ${INSTANCE_STYLED_MEMBER}\n}\n\n`,
    });
    needsMemberImports = true;
  } else {
    if (!ts.isObjectBindingPattern(param.name)) {
      return byHand('the component does not destructure its props');
    }
    const elements = param.name.elements;
    const destructured = elements.some((el) => {
      const key = el.propertyName ?? el.name;
      return ts.isIdentifier(key) && key.text === 'styled';
    });
    if (!destructured) {
      const rest = elements.find((el) => el.dotDotDotToken !== undefined);
      if (rest) {
        edits.push({
          start: rest.getStart(sf),
          end: rest.getStart(sf),
          replacement: 'styled, ',
        });
      } else if (elements.length > 0) {
        const last = elements[elements.length - 1]!;
        edits.push({
          start: last.getEnd(),
          end: last.getEnd(),
          replacement: ', styled',
        });
      } else {
        edits.push({
          start: param.name.getStart(sf),
          end: param.name.getEnd(),
          replacement: '{ styled }',
        });
      }
    }
    const type = param.type;
    if (type === undefined) {
      if (typeDecls.has(propsTypeName)) {
        return byHand(
          `the props are untyped and \`${propsTypeName}\` is taken`,
        );
      }
      edits.push({
        start: param.name.getEnd(),
        end: param.name.getEnd(),
        replacement: `: ${propsTypeName}`,
      });
      edits.push({
        start: fn.getStart(sf),
        end: fn.getStart(sf),
        replacement: `export interface ${propsTypeName} {\n  ${INSTANCE_STYLED_MEMBER}\n}\n\n`,
      });
      needsMemberImports = true;
    } else if (ts.isTypeLiteralNode(type)) {
      declareOn(type.members, type.getEnd() - 1);
    } else if (
      ts.isTypeReferenceNode(type) &&
      ts.isIdentifier(type.typeName) &&
      typeDecls.has(type.typeName.text)
    ) {
      const decl = typeDecls.get(type.typeName.text)!;
      if (ts.isInterfaceDeclaration(decl)) {
        declareOn(decl.members, decl.getEnd() - 1);
      } else if (ts.isTypeLiteralNode(decl.type)) {
        declareOn(decl.type.members, decl.type.getEnd() - 1);
      } else {
        return byHand(`\`${decl.name.text}\` is not an object type`);
      }
    } else {
      return byHand('the props type is not declared in this file');
    }
  }

  // ---- the wrapper around the returned root ----
  if (!isWrapperShape(jsx)) {
    const viewFrom = bound.get('View');
    if (viewFrom !== undefined && viewFrom !== '@mapples/ui') {
      return unchanged(
        `\`View\` here comes from ${viewFrom}, so instance styling was not added — wrap the root in a @mapples/ui View with \`styled={styled}\``,
      );
    }
    const start = jsx.getStart(sf);
    const end = jsx.getEnd();
    const lineStart = source.lastIndexOf('\n', start - 1) + 1;
    const indent = /^[ \t]*/.exec(source.slice(lineStart))![0];
    const templates = templateRanges(jsx);
    let inner = '';
    for (let i = start; i < end; i += 1) {
      inner += source[i];
      const insideTemplate = templates.some(([a, b]) => i >= a && i < b);
      if (source[i] === '\n' && !insideTemplate) inner += '  ';
    }
    edits.push({
      start,
      end,
      replacement: `<View styled={styled}>\n${indent}  ${inner}\n${indent}</View>`,
    });
  }

  if (edits.length === 0) return unchanged(null);
  for (const { module, name } of INSTANCE_STYLED_TYPE_IMPORTS) {
    const from = bound.get(name);
    if (needsMemberImports && from !== undefined && from !== module) {
      return unchanged(
        `\`${name}\` here comes from ${from}, so instance styling was not added — declare \`${INSTANCE_STYLED_MEMBER}\` with ${name} from ${module}`,
      );
    }
  }

  edits.sort((a, b) => b.start - a.start);
  let out = source;
  for (const e of edits)
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  out = upsertImports(out, [{ module: '@mapples/ui', named: ['View'] }]);
  if (needsMemberImports) {
    const lines = INSTANCE_STYLED_TYPE_IMPORTS.filter(
      ({ name }) => !bound.has(name),
    ).map(({ module, name }) => `import type { ${name} } from '${module}';`);
    if (lines.length > 0) {
      const outSf = parse(out);
      const lastImport = [...outSf.statements]
        .filter(ts.isImportDeclaration)
        .pop();
      const at = lastImport ? lastImport.getEnd() : 0;
      out = `${out.slice(0, at)}${at === 0 ? '' : '\n'}${lines.join('\n')}${at === 0 ? '\n\n' : ''}${out.slice(at)}`;
    }
  }
  return { source: out, note: null };
}
