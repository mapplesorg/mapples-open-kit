// Internal analyzer. The ONLY file (with print.ts being emit-only) that touches
// TypeScript AST types — nothing outside sid-ast may import from here.

import ts from 'typescript';

import { evalLiteral, NON_LITERAL, type LiteralResolver } from './literal.js';
import {
  negateCondition,
  propStateForCondition,
  propStateOf,
  type PropScope,
  type PropState,
} from './propConditions.js';
import { signatureOf } from './signature.js';
import {
  collectStyleDicts,
  countStyleRefs,
  entryLiteral,
  styleRefOf,
  type StyleDict,
  type StyleRef,
} from './styleDicts.js';
import type {
  ExtractOptions,
  ExtractWarning,
  RenderDomNode,
  Span,
} from './types.js';

export interface ImportedName {
  module: string;
  exportName: string; // 'default' or the named export
}

export interface AttrInfo {
  name: string; // '...' for spread attributes
  span: Span; // the whole attribute text
  literal: boolean; // false -> user expression; patch must preserve it byte-for-byte
  value?: unknown; // extracted value when literal
  raw: string;
  /** `styles.card` references the value was read through, by path into it. */
  styleRefs?: StyleRef[];
}

export interface ElementInfo {
  sid: string;
  span: Span; // the whole element
  attrsSpan: Span; // region holding the attributes (after tag name, before `>` / `/>`)
  innerSpan: Span | null; // between `>` and `</…>`; null when self-closing
  tagName: string;
  selfClosing: boolean;
  parentSid: string | null;
  childSids: string[]; // nearest $sid descendants, document order
  attrs: AttrInfo[];
  /** The element is a direct JSX child (`<A><X/></A>`), where a guard can wrap it. */
  jsxChild: boolean;
  /** The prop test the element renders under: `{isActive && <X/>}` or a ternary branch. */
  guard: ElementGuard | null;
}

export interface ElementGuard {
  /** The whole `{…}` expression container. */
  span: Span;
  kind: 'and' | 'ternary';
  /** The test as a condition — `_visible`'s key on the node. */
  condition: string;
}

export interface Analysis {
  roots: RenderDomNode[];
  nodes: Map<string, RenderDomNode>;
  info: Map<string, ElementInfo>;
  warnings: ExtractWarning[];
  /** Render states the file's prop tests declare (`isActive && styles.x`), by state key. */
  states: Map<string, PropState>;
  imports: Map<string, ImportedName>; // local identifier -> origin
  /** Where a style dictionary entry's object literal sits, or null when there is none. */
  styleEntrySpan(dict: string, key: string): Span | null;
  /** How many places in the file read `dict.key`. */
  styleRefCount(dict: string, key: string): number;
}

export const DEFAULT_PRIMITIVE_MODULES = ['@mapples/ui'] as const;

export { evalLiteral, NON_LITERAL } from './literal.js';

/** JSX text normalization (React semantics, simplified): whitespace runs containing a newline collapse; ends trimmed. */
export function normalizeJsxText(raw: string): string {
  return raw.replace(/[ \t]*\r?\n[ \t]*/g, ' ').trim();
}

function collectImports(sf: ts.SourceFile): Map<string, ImportedName> {
  const imports = new Map<string, ImportedName>();
  for (const stmt of sf.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier)
    )
      continue;
    const module = stmt.moduleSpecifier.text;
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.name)
      imports.set(clause.name.text, { module, exportName: 'default' });
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const el of clause.namedBindings.elements) {
        imports.set(el.name.text, {
          module,
          exportName: (el.propertyName ?? el.name).text,
        });
      }
    }
  }
  return imports;
}

type JsxLike = ts.JsxOpeningElement | ts.JsxSelfClosingElement;

function jsxParts(node: ts.Node): {
  open: JsxLike;
  selfClosing: boolean;
  element: ts.JsxElement | ts.JsxSelfClosingElement;
} | null {
  if (ts.isJsxElement(node)) {
    return { open: node.openingElement, selfClosing: false, element: node };
  }
  if (ts.isJsxSelfClosingElement(node)) {
    return { open: node, selfClosing: true, element: node };
  }
  return null;
}

function getSidAttr(open: JsxLike): string | null {
  for (const prop of open.attributes.properties) {
    if (
      ts.isJsxAttribute(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === '$sid' &&
      prop.initializer &&
      ts.isStringLiteral(prop.initializer)
    ) {
      return prop.initializer.text;
    }
  }
  return null;
}

export function analyze(
  source: string,
  options: ExtractOptions = {},
): Analysis {
  const primitiveModules = new Set(
    options.primitiveModules ?? DEFAULT_PRIMITIVE_MODULES,
  );
  const sf = ts.createSourceFile(
    'file.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = collectImports(sf);
  const styleDicts = collectStyleDicts(sf);
  const signature = signatureOf(sf);
  const propScope: PropScope | null = signature
    ? {
        params: new Map(signature.signature.params.map((p) => [p.name, p])),
        bindings: signature.bindings,
      }
    : null;
  const states = new Map<string, PropState>();
  const warnings: ExtractWarning[] = [];
  const nodes = new Map<string, RenderDomNode>();
  const info = new Map<string, ElementInfo>();
  const roots: RenderDomNode[] = [];

  // `{isActive && <X $sid/>}` and `{isActive ? <A $sid/> : <B $sid/>}`:
  // each guarded element, by its JSX node, with the test it renders under.
  const guards = new Map<ts.Node, ElementGuard>();
  const sidElement = (expr: ts.Expression): ts.Node | null => {
    let e = expr;
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    const parts = jsxParts(e);
    return parts && getSidAttr(parts.open) !== null ? parts.element : null;
  };
  const readGuards = (container: ts.JsxExpression): void => {
    if (propScope === null || !container.expression) return;
    let e = container.expression;
    while (ts.isParenthesizedExpression(e)) e = e.expression;
    const span = { start: container.getStart(sf), end: container.getEnd() };
    if (
      ts.isBinaryExpression(e) &&
      e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
    ) {
      const element = sidElement(e.right);
      const state = element ? propStateOf(e.left, propScope) : null;
      if (element && state) {
        guards.set(element, { span, kind: 'and', condition: state.condition });
        states.set(state.key, state);
      }
    } else if (ts.isConditionalExpression(e)) {
      const state = propStateOf(e.condition, propScope);
      if (state === null) return;
      const whenTrue = sidElement(e.whenTrue);
      const whenFalse = sidElement(e.whenFalse);
      if (whenTrue) {
        guards.set(whenTrue, {
          span,
          kind: 'ternary',
          condition: state.condition,
        });
        states.set(state.key, state);
      }
      if (whenFalse) {
        const negated = propStateForCondition(negateCondition(state.condition));
        if (negated !== null) {
          guards.set(whenFalse, {
            span,
            kind: 'ternary',
            condition: negated.condition,
          });
          states.set(negated.key, negated);
        }
      }
    }
  };

  const visit = (
    node: ts.Node,
    parent: { dom: RenderDomNode; info: ElementInfo } | null,
  ): void => {
    if (ts.isJsxExpression(node)) readGuards(node);
    const parts = jsxParts(node);
    if (parts) {
      const sid = getSidAttr(parts.open);
      if (sid !== null) {
        const built = buildNode(sid, parts, parent);
        // Recurse into children with this node as the nearest $sid ancestor.
        // A duplicate sid (built === null) stays invisible: keep the old parent.
        if (!parts.selfClosing && ts.isJsxElement(parts.element)) {
          for (const child of parts.element.children)
            visit(child, built ?? parent);
        }
        return;
      }
    }
    // Not a $sid element: invisible; keep walking with the same parent.
    ts.forEachChild(node, (child) => visit(child, parent));
  };

  const buildNode = (
    sid: string,
    parts: NonNullable<ReturnType<typeof jsxParts>>,
    parent: { dom: RenderDomNode; info: ElementInfo } | null,
  ): { dom: RenderDomNode; info: ElementInfo } | null => {
    if (nodes.has(sid)) {
      warnings.push({
        kind: 'DUPLICATE_SID',
        sid,
        detail: `sid ${sid} appears more than once; later occurrence ignored`,
      });
      return null;
    }
    const { open, selfClosing, element } = parts;
    const tagName = open.tagName.getText(sf);

    // Classify: primitive (imported from a primitive module) vs Custom.
    const origin = imports.get(tagName);
    const isPrimitive =
      origin !== undefined && primitiveModules.has(origin.module);

    let type: string;
    const props: Record<string, unknown> = {};
    const layout: Record<string, unknown> = {};
    const attrs: AttrInfo[] = [];
    let fallbackSize: unknown;
    let refProps: Record<string, string> | undefined;
    let dataProps: Record<string, unknown> | undefined;
    let actionProps: Record<string, unknown> | undefined;

    for (const prop of open.attributes.properties) {
      const attrSpan: Span = { start: prop.getStart(sf), end: prop.getEnd() };
      const raw = source.slice(attrSpan.start, attrSpan.end);
      if (!ts.isJsxAttribute(prop) || !ts.isIdentifier(prop.name)) {
        // Spread attributes etc. are not literal-analyzable.
        attrs.push({ name: '...', span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          detail: `unanalyzable attribute on <${tagName}>; keeping last-known value from base`,
        });
        continue;
      }
      const name = prop.name.text;
      if (name === '$sid') {
        attrs.push({ name, span: attrSpan, literal: true, value: sid, raw });
        continue;
      }
      if (name === '$fallback') {
        if (
          prop.initializer &&
          ts.isJsxExpression(prop.initializer) &&
          prop.initializer.expression
        ) {
          const v = evalLiteral(prop.initializer.expression);
          if (v !== NON_LITERAL) {
            fallbackSize = v;
            attrs.push({ name, span: attrSpan, literal: true, value: v, raw });
            continue;
          }
        }
        attrs.push({ name, span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: '$fallback',
          detail: '$fallback must be a literal {w, h}',
        });
        continue;
      }
      if (name === '$refs' || name === '$data' || name === '$actions') {
        if (
          prop.initializer &&
          ts.isJsxExpression(prop.initializer) &&
          prop.initializer.expression
        ) {
          const v = evalLiteral(prop.initializer.expression);
          if (
            v !== NON_LITERAL &&
            typeof v === 'object' &&
            v !== null &&
            !Array.isArray(v)
          ) {
            if (name === '$refs') refProps = v as Record<string, string>;
            else if (name === '$data') dataProps = v as Record<string, unknown>;
            else actionProps = v as Record<string, unknown>;
            attrs.push({ name, span: attrSpan, literal: true, value: v, raw });
            continue;
          }
        }
        attrs.push({ name, span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: name,
          detail:
            name === '$refs'
              ? '$refs must be a literal object of ref(...) strings'
              : `${name} must be a literal JSON object`,
        });
        continue;
      }
      if (name.startsWith('$')) {
        // Transient props are tooling/user-only by convention: never canvas data.
        attrs.push({ name, span: attrSpan, literal: false, raw });
        continue;
      }

      let value: unknown | typeof NON_LITERAL;
      // A `styles.card` reference reads as the dictionary entry it names —
      // the file keeps its styles where the developer put them.
      const styleRefs: StyleRef[] = [];
      const resolveStyleRef = (
        expr: ts.Expression,
        path: string[],
      ): unknown | undefined => {
        const ref = styleRefOf(expr, styleDicts);
        if (!ref) return undefined;
        const literal = entryLiteral(ref.entry);
        if (literal === NON_LITERAL) return undefined;
        styleRefs.push({ dict: ref.dict.name, key: ref.entry.key, path });
        return literal;
      };
      if (!prop.initializer) value = true;
      else if (ts.isStringLiteral(prop.initializer))
        value = prop.initializer.text;
      else if (
        ts.isJsxExpression(prop.initializer) &&
        prop.initializer.expression
      ) {
        value =
          name === 'styled'
            ? evalStyled(prop.initializer.expression, resolveStyleRef)
            : evalLiteral(prop.initializer.expression, resolveStyleRef);
      } else value = NON_LITERAL;

      if (value === NON_LITERAL) {
        attrs.push({ name, span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: name,
          detail: `prop \`${name}\` on <${tagName}> is an expression; keeping last-known value from base`,
        });
        continue;
      }
      attrs.push({
        name,
        span: attrSpan,
        literal: true,
        value,
        raw,
        ...(styleRefs.length > 0 ? { styleRefs } : {}),
      });
      (isPrimitive ? props : layout)[name] = value;
    }

    // Text children -> props.children (only meaningful when no $sid children land later).
    let text = '';
    if (!selfClosing && ts.isJsxElement(element)) {
      for (const child of element.children) {
        if (ts.isJsxText(child))
          text += normalizeJsxText(child.text)
            ? normalizeJsxText(child.text) + ' '
            : '';
        else if (ts.isJsxExpression(child) && child.expression) {
          const v = evalLiteral(child.expression);
          if (typeof v === 'string' || typeof v === 'number')
            text += String(v) + ' ';
          else if (v === NON_LITERAL && !containsJsx(child)) {
            warnings.push({
              kind: 'NON_LITERAL_PROP',
              sid,
              prop: 'children',
              detail: `text child of <${tagName}> is an expression; keeping last-known value from base`,
            });
          }
        }
      }
    }
    text = text.trimEnd();

    if (isPrimitive) {
      type = tagName;
      if (text) props.children = text;
    } else {
      type = 'Custom';
      if (!origin) {
        warnings.push({
          kind: 'UNKNOWN_ELEMENT_WITH_SID',
          sid,
          detail: `<${tagName}> carries $sid but is not imported; recorded as local Custom (#${tagName})`,
        });
      }
      props.name = tagName;
      props.importRef = origin
        ? `${origin.module}#${origin.exportName}`
        : `#${tagName}`;
      props.layout = layout;
      props.fallbackSize = fallbackSize ?? { w: 100, h: 100 };
    }

    const guard = guards.get(element) ?? null;
    if (guard !== null) {
      if (dataProps?._visible !== undefined) {
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: '_visible',
          detail: `<${tagName}> renders under a prop test; its $data _visible binding is replaced by that test`,
        });
      }
      dataProps = {
        ...(dataProps ?? {}),
        _visible: { key: guard.condition, active: true },
      };
    }

    const dom: RenderDomNode = {
      sid,
      type,
      props,
      children: [],
      ...(refProps && Object.keys(refProps).length > 0 ? { refProps } : {}),
      ...(dataProps && Object.keys(dataProps).length > 0 ? { dataProps } : {}),
      ...(actionProps && Object.keys(actionProps).length > 0
        ? { actionProps }
        : {}),
    };

    const openEnd = open.getEnd(); // end of `>` or `/>`
    const attrsEnd = openEnd - (selfClosing ? 2 : 1);
    const nameEnd = open.tagName.getEnd();
    const elInfo: ElementInfo = {
      sid,
      span: { start: element.getStart(sf), end: element.getEnd() },
      attrsSpan: { start: nameEnd, end: attrsEnd },
      innerSpan:
        !selfClosing && ts.isJsxElement(element)
          ? {
              start: element.openingElement.getEnd(),
              end: element.closingElement.getStart(sf),
            }
          : null,
      tagName,
      selfClosing,
      parentSid: parent?.dom.sid ?? null,
      childSids: [],
      attrs,
      jsxChild: ts.isJsxElement(element.parent),
      guard,
    };

    nodes.set(sid, dom);
    info.set(sid, elInfo);
    if (parent) {
      parent.dom.children.push(dom);
      parent.info.childSids.push(sid);
    } else {
      roots.push(dom);
    }
    return { dom, info: elInfo };
  };

  /**
   * A `styled` object whose keys may depend on a prop test:
   * `style: isActive ? styles.on : styles.off`, `style: isActive && styles.on`
   * or `style: [styles.base, isActive && styles.on]`. Each test becomes a
   * state and its style a `style::<state>` variant over the base — the shape
   * the canvas renders conditional styles from. NON_LITERAL when any key is
   * something else.
   */
  const evalStyled = (
    expr: ts.Expression,
    resolve: LiteralResolver,
  ): unknown | typeof NON_LITERAL => {
    const literal = evalLiteral(expr, resolve);
    if (literal !== NON_LITERAL || propScope === null) return literal;
    let object = expr;
    while (ts.isParenthesizedExpression(object)) object = object.expression;
    if (!ts.isObjectLiteralExpression(object)) return NON_LITERAL;

    const out: Record<string, unknown> = {};
    const found = new Map<string, PropState>();
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) return NON_LITERAL;
      if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))
        return NON_LITERAL;
      const key = property.name.text;
      const plain = evalLiteral(property.initializer, resolve, [key]);
      if (plain !== NON_LITERAL) {
        out[key] = plain;
        continue;
      }

      const variant = (test: ts.Expression, style: ts.Expression): boolean => {
        const state = propStateOf(test, propScope);
        if (state === null) return false;
        const slot = `${key}::${state.key}`;
        const value = evalLiteral(style, resolve, [slot]);
        if (value === NON_LITERAL) return false;
        found.set(state.key, state);
        out[slot] = value;
        return true;
      };
      const conditional = (element: ts.Expression): boolean => {
        let e = element;
        while (ts.isParenthesizedExpression(e)) e = e.expression;
        return (
          ts.isBinaryExpression(e) &&
          e.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
          variant(e.left, e.right)
        );
      };

      let init = property.initializer;
      while (ts.isParenthesizedExpression(init)) init = init.expression;
      if (ts.isConditionalExpression(init)) {
        const base = evalLiteral(init.whenFalse, resolve, [key]);
        if (base === NON_LITERAL || !variant(init.condition, init.whenTrue))
          return NON_LITERAL;
        out[key] = base;
      } else if (ts.isArrayLiteralExpression(init)) {
        for (const [i, element] of init.elements.entries()) {
          if (conditional(element)) continue;
          if (i !== 0) return NON_LITERAL;
          const base = evalLiteral(element, resolve, [key]);
          if (base === NON_LITERAL) return NON_LITERAL;
          out[key] = base;
        }
      } else if (!conditional(init)) {
        return NON_LITERAL;
      }
    }
    for (const [key, state] of found) states.set(key, state);
    return out;
  };

  const containsJsx = (n: ts.Node): boolean => {
    let found = false;
    const walk = (x: ts.Node): void => {
      if (found) return;
      if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x)) {
        found = true;
        return;
      }
      ts.forEachChild(x, walk);
    };
    walk(n);
    return found;
  };

  visit(sf, null);
  const dictFor = (name: string): StyleDict | undefined => styleDicts.get(name);
  return {
    roots,
    nodes,
    info,
    warnings,
    states,
    imports,
    styleEntrySpan: (dict, key) =>
      dictFor(dict)?.entries.get(key)?.span ?? null,
    styleRefCount: (dict, key) => {
      const d = dictFor(dict);
      return d ? countStyleRefs(sf, d, key) : 0;
    },
  };
}
