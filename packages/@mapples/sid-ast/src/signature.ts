// The props a component file declares: the first parameter's type of the
// default-exported component, read from the TypeScript AST. Pure: string in,
// JSON out — the Creator turns it into inspector fields for instances.

import ts from 'typescript';

import { evalLiteral, NON_LITERAL } from './literal.js';

export type PropsParamKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'literals'
  | 'function'
  | 'other';

export interface PropsParam {
  name: string;
  optional: boolean;
  kind: PropsParamKind;
  /** The type as written, for display and for `other`. */
  typeText: string;
  /** The string literals of a `'a' | 'b'` union. */
  literals?: string[];
}

export interface PropsSignature {
  /** The default-exported component's name, when it has one. */
  componentName: string | null;
  /** The props type's name when it is a named interface/alias, else null (inline or none). */
  typeName: string | null;
  params: PropsParam[];
  /**
   * Literal defaults the component destructures its props with
   * (`{ isActive = true }`), by prop name — what a component renders with
   * when nothing passes the prop.
   */
  defaults: Record<string, unknown>;
}

/**
 * How the component body names its props: destructured locals by the prop
 * they bind (`{ isActive: active }` → `active` → `isActive`), and the
 * parameter's own name when it is not destructured (`props`).
 */
export interface PropsBindings {
  locals: Map<string, string>;
  paramName: string | null;
}

const FC_NAMES = new Set([
  'FC',
  'FunctionComponent',
  'React.FC',
  'React.FunctionComponent',
]);

/**
 * `extractPropsSignature(source)` → the default export's props, or null when
 * the file has no default-exported function/arrow component. A component
 * without a typed first parameter yields an empty `params`.
 */
export function extractPropsSignature(source: string): PropsSignature | null {
  const sf = ts.createSourceFile(
    'f.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  return signatureOf(sf)?.signature ?? null;
}

/** The signature and the body's names for the props, from a parsed file. Internal. */
export function signatureOf(
  sf: ts.SourceFile,
): { signature: PropsSignature; bindings: PropsBindings } | null {
  const typeDecls = new Map<
    string,
    ts.InterfaceDeclaration | ts.TypeAliasDeclaration
  >();
  const functions = new Map<string, ts.FunctionDeclaration>();
  const variables = new Map<string, ts.VariableDeclaration>();
  let defaultFn: ts.FunctionDeclaration | null = null;
  let defaultName: string | null = null;

  for (const stmt of sf.statements) {
    if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt)) {
      typeDecls.set(stmt.name.text, stmt);
    } else if (ts.isFunctionDeclaration(stmt)) {
      const mods = stmt.modifiers ?? [];
      const isExport = mods.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = mods.some(
        (m) => m.kind === ts.SyntaxKind.DefaultKeyword,
      );
      if (isExport && isDefault) defaultFn = stmt;
      if (stmt.name) functions.set(stmt.name.text, stmt);
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) variables.set(decl.name.text, decl);
      }
    } else if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      if (ts.isIdentifier(stmt.expression)) defaultName = stmt.expression.text;
    }
  }

  let fn:
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.FunctionExpression
    | null = defaultFn;
  let componentName: string | null = defaultFn?.name?.text ?? null;
  let fcPropsType: ts.TypeNode | null = null;
  if (fn === null && defaultName !== null) {
    componentName = defaultName;
    const named = functions.get(defaultName);
    if (named) fn = named;
    else {
      const variable = variables.get(defaultName);
      const init = variable?.initializer;
      if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)))
        fn = init;
      // `const Card: FC<Props> = (…) =>` types the props on the variable.
      if (variable?.type && ts.isTypeReferenceNode(variable.type)) {
        const refName = variable.type.typeName.getText(sf);
        const arg = variable.type.typeArguments?.[0];
        if (FC_NAMES.has(refName) && arg) fcPropsType = arg;
      }
    }
  }
  if (fn === null) return null;

  const param = fn.parameters[0];
  const bindings: PropsBindings = { locals: new Map(), paramName: null };
  const defaults: Record<string, unknown> = {};
  if (param && ts.isIdentifier(param.name)) {
    bindings.paramName = param.name.text;
  } else if (param && ts.isObjectBindingPattern(param.name)) {
    for (const element of param.name.elements) {
      if (element.dotDotDotToken || !ts.isIdentifier(element.name)) continue;
      const local = element.name.text;
      const prop =
        element.propertyName === undefined
          ? local
          : ts.isIdentifier(element.propertyName) ||
              ts.isStringLiteral(element.propertyName)
            ? element.propertyName.text
            : null;
      if (prop === null) continue;
      bindings.locals.set(local, prop);
      if (element.initializer) {
        const value = evalLiteral(element.initializer);
        if (value !== NON_LITERAL) defaults[prop] = value;
      }
    }
  }

  const propsType = param?.type ?? fcPropsType;
  if (!propsType) {
    return {
      signature: { componentName, typeName: null, params: [], defaults },
      bindings,
    };
  }

  const resolved = resolveMembers(propsType, typeDecls, sf, new Set());
  return {
    signature: {
      componentName,
      typeName: resolved.typeName,
      params: resolved.members,
      defaults,
    },
    bindings,
  };
}

function resolveMembers(
  type: ts.TypeNode,
  typeDecls: Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>,
  sf: ts.SourceFile,
  seen: Set<string>,
): { typeName: string | null; members: PropsParam[] } {
  if (ts.isTypeLiteralNode(type)) {
    return { typeName: null, members: membersOf(type.members, typeDecls, sf) };
  }
  if (ts.isTypeReferenceNode(type)) {
    const name = type.typeName.getText(sf);
    if (seen.has(name)) return { typeName: name, members: [] };
    seen.add(name);
    const decl = typeDecls.get(name);
    if (decl && ts.isInterfaceDeclaration(decl)) {
      return {
        typeName: name,
        members: membersOf(decl.members, typeDecls, sf),
      };
    }
    if (decl && ts.isTypeAliasDeclaration(decl)) {
      const inner = resolveMembers(decl.type, typeDecls, sf, seen);
      return { typeName: name, members: inner.members };
    }
    return { typeName: name, members: [] };
  }
  if (ts.isIntersectionTypeNode(type)) {
    const members: PropsParam[] = [];
    for (const part of type.types)
      members.push(...resolveMembers(part, typeDecls, sf, seen).members);
    return { typeName: null, members };
  }
  return { typeName: null, members: [] };
}

function membersOf(
  members: ts.NodeArray<ts.TypeElement>,
  typeDecls: Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>,
  sf: ts.SourceFile,
): PropsParam[] {
  const out: PropsParam[] = [];
  for (const member of members) {
    if (ts.isMethodSignature(member) && member.name) {
      out.push({
        name: member.name.getText(sf),
        optional: member.questionToken !== undefined,
        kind: 'function',
        typeText: member.getText(sf),
      });
      continue;
    }
    if (!ts.isPropertySignature(member) || !member.name) continue;
    const name =
      ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)
        ? member.name.text
        : member.name.getText(sf);
    const typeText = member.type ? member.type.getText(sf) : 'unknown';
    const classified = member.type
      ? classify(member.type, typeDecls, sf)
      : { kind: 'other' as const };
    out.push({
      name,
      optional: member.questionToken !== undefined,
      typeText,
      ...classified,
    });
  }
  return out;
}

function classify(
  type: ts.TypeNode,
  typeDecls: Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>,
  sf: ts.SourceFile,
): { kind: PropsParamKind; literals?: string[] } {
  switch (type.kind) {
    case ts.SyntaxKind.StringKeyword:
      return { kind: 'string' };
    case ts.SyntaxKind.NumberKeyword:
      return { kind: 'number' };
    case ts.SyntaxKind.BooleanKeyword:
      return { kind: 'boolean' };
    default:
      break;
  }
  if (ts.isFunctionTypeNode(type)) return { kind: 'function' };
  if (ts.isParenthesizedTypeNode(type))
    return classify(type.type, typeDecls, sf);
  if (ts.isUnionTypeNode(type)) {
    const literals: string[] = [];
    let base: { kind: PropsParamKind; literals?: string[] } | null = null;
    for (const part of type.types) {
      // `| undefined` / `| null` only mark optionality
      if (
        part.kind === ts.SyntaxKind.UndefinedKeyword ||
        (ts.isLiteralTypeNode(part) &&
          part.literal.kind === ts.SyntaxKind.NullKeyword)
      ) {
        continue;
      }
      if (ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal)) {
        literals.push(part.literal.text);
        continue;
      }
      const inner = classify(part, typeDecls, sf);
      base =
        base === null || base.kind === inner.kind ? inner : { kind: 'other' };
    }
    if (literals.length > 0 && base === null)
      return { kind: 'literals', literals };
    if (literals.length === 0 && base !== null) return base;
    return { kind: 'other' };
  }
  if (ts.isTypeReferenceNode(type)) {
    const decl = typeDecls.get(type.typeName.getText(sf));
    if (decl && ts.isTypeAliasDeclaration(decl))
      return classify(decl.type, typeDecls, sf);
  }
  return { kind: 'other' };
}
