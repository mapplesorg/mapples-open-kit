// Internal analyzer. The ONLY file (with print.ts being emit-only) that touches
// TypeScript AST types — nothing outside sid-ast may import from here.

import ts from 'typescript';

import { evalLiteral, NON_LITERAL, type LiteralResolver } from './literal.js';
import {
  handlerBindingOf,
  negateCondition,
  propBindingOf,
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
  /** The prop the attribute passes on (`title={title}` → `props.title`): a `dataProps` entry the code owns. */
  propBinding?: string;
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
  /**
   * `dataProps` keys the code binds by passing a prop on (`title={title}`,
   * `{title}` as the text → `children`) — never written into `$data`.
   */
  propBindings: string[];
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

export const DEFAULT_PRIMITIVE_MODULES = [
  '@mapples/ui',
  '@mapples/components',
] as const;

export { evalLiteral, NON_LITERAL } from './literal.js';

function isBlank(char: string | undefined): boolean {
  return char === ' ' || char === '\t';
}

/** JSX text normalization (React semantics, simplified): whitespace runs containing a newline collapse; ends trimmed. */
export function normalizeJsxText(raw: string): string {
  // Same result as `raw.replace(/[ \t]*\r?\n[ \t]*/g, ' ').trim()`, without
  // the regex's quadratic rescans of long space/tab runs.
  const lines = raw.split('\n');
  return lines
    .map((line, i) => {
      let start = 0;
      let end = line.length;
      if (i < lines.length - 1) {
        if (line[end - 1] === '\r') end--;
        while (end > 0 && isBlank(line[end - 1])) end--;
      }
      if (i > 0) while (start < end && isBlank(line[start])) start++;
      return line.slice(start, end);
    })
    .join(' ')
    .trim();
}

/**
 * React's event-prop convention (`onPress`, `onChangeText`): a handler, which
 * is code the file owns — the canvas stores no value for it (its actions live
 * in `$actions`).
 */
export function isEventProp(name: string): boolean {
  return /^on[A-Z]/.test(name);
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

/** An asset reference as `$refs` holds it: `ref(image:<uuid>:<name>)`. */
const ASSET_REF_RE = /^ref\([a-z]+:[^:()]+:[^()]*\)$/;

/**
 * Asset refs written into a prop's literal data (`items={[{ thumbnail:
 * 'ref(image:…)' }]}`), with their `$refs` path (`items.0.thumbnail`).
 * Nothing resolves them there: the renderers resolve `$refs` only.
 */
function inlineAssetRefs(
  value: unknown,
  path: string,
  out: { path: string; ref: string }[],
): void {
  if (typeof value === 'string') {
    if (ASSET_REF_RE.test(value)) out.push({ path, ref: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => inlineAssetRefs(v, `${path}.${i}`, out));
  } else if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value))
      inlineAssetRefs(v, `${path}.${k}`, out);
  }
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
  /**
   * Guarded elements whose test is not one prop test (`a && b`, a local):
   * the test as written, so the element's warning can name it.
   */
  const unreadGuards = new Map<ts.Node, string>();
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
      } else if (element) {
        unreadGuards.set(element, e.left.getText(sf));
      }
    } else if (ts.isConditionalExpression(e)) {
      const state = propStateOf(e.condition, propScope);
      const whenTrue = sidElement(e.whenTrue);
      const whenFalse = sidElement(e.whenFalse);
      if (state === null) {
        const test = e.condition.getText(sf);
        if (whenTrue) unreadGuards.set(whenTrue, test);
        if (whenFalse) unreadGuards.set(whenFalse, `!(${test})`);
        return;
      }
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
        } else {
          unreadGuards.set(whenFalse, `!(${e.condition.getText(sf)})`);
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
        detail: `$sid="${sid}" is used by more than one element; the canvas ignores the copy — remove $sid from it and it gets its own id`,
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
    /** `styled` variants the canvas cannot hold, as written (see evalStyled). */
    const droppedVariants: string[] = [];
    let fallbackSize: unknown;
    let refProps: Record<string, string> | undefined;
    let dataProps: Record<string, unknown> | undefined;
    let actionProps: Record<string, unknown> | undefined;
    // `title={title}`: the canvas reads the instance's prop through a
    // `props.title` binding, the file keeps passing it in code. On another
    // component's tag it is what that nested instance gets, so a default of
    // the outer component reaches the inner one.
    const passed: Record<string, { key: string; active: true }> = {};
    const passedOn = (expr: ts.Expression | undefined): string | null =>
      propScope !== null && expr !== undefined
        ? propBindingOf(expr, propScope)
        : null;

    for (const prop of open.attributes.properties) {
      const attrSpan: Span = { start: prop.getStart(sf), end: prop.getEnd() };
      const raw = source.slice(attrSpan.start, attrSpan.end);
      if (!ts.isJsxAttribute(prop) || !ts.isIdentifier(prop.name)) {
        // Spread attributes etc. are not literal-analyzable.
        attrs.push({ name: '...', span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          detail: `the spread on <${tagName}> is code the Creator can't read; the canvas keeps the props it last had`,
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
          detail: `$fallback on <${tagName}> must be a literal like {{ w: 100, h: 100 }}; the canvas keeps the size it last had`,
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
              ? `$refs on <${tagName}> must be an object literal of ref(...) strings; the canvas keeps the references it last had`
              : `${name} on <${tagName}> must be a plain object literal; the canvas keeps the value it last had`,
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
      if (isEventProp(name)) {
        const forwarded =
          isPrimitive &&
          propScope !== null &&
          prop.initializer !== undefined &&
          ts.isJsxExpression(prop.initializer) &&
          prop.initializer.expression !== undefined
            ? handlerBindingOf(prop.initializer.expression, propScope)
            : null;
        if (forwarded !== null) {
          // `onPress={onPress}`: the instance's own handler, like a data
          // prop passed on — a binding the code owns.
          attrs.push({
            name,
            span: attrSpan,
            literal: false,
            raw,
            propBinding: forwarded,
          });
          passed[name] = { key: forwarded, active: true };
          continue;
        }
        attrs.push({ name, span: attrSpan, literal: false, raw });
        const handler =
          prop.initializer !== undefined &&
          ts.isJsxExpression(prop.initializer) &&
          prop.initializer.expression !== undefined &&
          evalLiteral(prop.initializer.expression) === NON_LITERAL;
        warnings.push(
          handler
            ? {
                kind: 'NON_LITERAL_PROP',
                sid,
                prop: name,
                severity: 'info',
                detail: `\`${name}\` on <${tagName}> runs your code in the app; the canvas preview doesn't run it`,
              }
            : {
                kind: 'NON_LITERAL_PROP',
                sid,
                prop: name,
                detail: `\`${name}\` on <${tagName}> needs a function, like ${name}={() => …}`,
              },
        );
        continue;
      }
      if (!prop.initializer) value = true;
      else if (ts.isStringLiteral(prop.initializer))
        value = prop.initializer.text;
      else if (
        ts.isJsxExpression(prop.initializer) &&
        prop.initializer.expression
      ) {
        droppedVariants.length = 0;
        value =
          name === 'styled'
            ? evalStyled(
                prop.initializer.expression,
                resolveStyleRef,
                droppedVariants,
              )
            : evalLiteral(prop.initializer.expression, resolveStyleRef);
      } else value = NON_LITERAL;

      if (value === NON_LITERAL) {
        const binding = passedOn(
          prop.initializer && ts.isJsxExpression(prop.initializer)
            ? prop.initializer.expression
            : undefined,
        );
        if (binding !== null) {
          attrs.push({
            name,
            span: attrSpan,
            literal: false,
            raw,
            propBinding: binding,
          });
          passed[name] = { key: binding, active: true };
          continue;
        }
        attrs.push({ name, span: attrSpan, literal: false, raw });
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: name,
          detail: `\`${name}\` on <${tagName}> is computed in code; the canvas shows the value it last had in the Creator`,
        });
        continue;
      }
      if (droppedVariants.length > 0) {
        // The base style and the readable variants reach the canvas; the
        // attribute stays the code's (non-literal), so a Creator edit can
        // never reprint it without the variants the canvas could not hold.
        const line =
          sf.getLineAndCharacterOfPosition(prop.getStart(sf)).line + 1;
        for (const dropped of droppedVariants.splice(0)) {
          warnings.push({
            kind: 'UNSUPPORTED_CONDITION',
            sid,
            prop: name,
            detail: `\`${dropped}\` in \`${name}\` on <${tagName}> (line ${line}) is not a test on one prop, so the canvas keeps the base style without this variant. Test a single prop instead, e.g. one boolean prop for this case`,
          });
        }
        attrs.push({ name, span: attrSpan, literal: false, raw });
        (isPrimitive ? props : layout)[name] = value;
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
      // `<Text>{title}</Text>`: the text is the prop, when nothing else is.
      const content = element.children.filter(
        (child) => !ts.isJsxText(child) || normalizeJsxText(child.text) !== '',
      );
      const only = content.length === 1 ? content[0] : undefined;
      const textBinding =
        only !== undefined && ts.isJsxExpression(only)
          ? passedOn(only.expression)
          : null;
      if (textBinding !== null) {
        passed.children = { key: textBinding, active: true };
      }
      for (const child of element.children) {
        if (ts.isJsxText(child))
          text += normalizeJsxText(child.text)
            ? normalizeJsxText(child.text) + ' '
            : '';
        else if (ts.isJsxExpression(child) && child.expression) {
          const v = evalLiteral(child.expression);
          if (typeof v === 'string' || typeof v === 'number')
            text += String(v) + ' ';
          else if (
            v === NON_LITERAL &&
            !containsJsx(child) &&
            textBinding === null
          ) {
            warnings.push({
              kind: 'NON_LITERAL_PROP',
              sid,
              prop: 'children',
              detail: `the text of <${tagName}> is computed in code; the canvas shows the text it last had in the Creator`,
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
          detail: `<${tagName}> isn't imported, so the canvas can't render it and shows a placeholder`,
        });
      }
      props.name = tagName;
      props.importRef = origin
        ? `${origin.module}#${origin.exportName}`
        : `#${tagName}`;
      props.layout = layout;
      props.fallbackSize = fallbackSize ?? { w: 100, h: 100 };
    }

    // An explicit `$data` entry wins over a prop passed on under the same
    // name, as it does when the app renders the element.
    const propBindings = Object.keys(passed).filter(
      (key) => dataProps?.[key] === undefined,
    );
    if (propBindings.length > 0) {
      dataProps = { ...passed, ...(dataProps ?? {}) };
    }

    const inlineRefs: { path: string; ref: string }[] = [];
    for (const [key, value] of Object.entries(props))
      inlineAssetRefs(value, key, inlineRefs);
    for (const { path, ref } of inlineRefs) {
      if (refProps?.[path] !== undefined) continue;
      warnings.push({
        kind: 'INLINE_ASSET_REF',
        sid,
        prop: path.split('.')[0],
        detail: `<${tagName}> ${path} holds ${ref}, which only resolves from $refs — move it to $refs={{ '${path}': '${ref}' }} (a dotted key reaches into the prop's data)`,
      });
    }

    const guard = guards.get(element) ?? null;
    const unreadGuard = unreadGuards.get(element);
    if (guard === null && unreadGuard !== undefined) {
      const line =
        sf.getLineAndCharacterOfPosition(element.getStart(sf)).line + 1;
      warnings.push({
        kind: 'UNSUPPORTED_CONDITION',
        sid,
        prop: '_visible',
        detail: `<${tagName}> (line ${line}) renders only when \`${unreadGuard}\` in the code — not a test on one prop, so the canvas always shows it. Test a single prop instead, e.g. one boolean prop for this case`,
      });
    }
    if (guard !== null) {
      if (dataProps?._visible !== undefined) {
        warnings.push({
          kind: 'NON_LITERAL_PROP',
          sid,
          prop: '_visible',
          detail: `<${tagName}> is wrapped in a prop test in the code, which replaces its $data _visible binding`,
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
      propBindings,
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
    dropped: string[],
  ): unknown | typeof NON_LITERAL => {
    const literal = evalLiteral(expr, resolve);
    if (literal !== NON_LITERAL) return literal;
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
        // A file with no props signature (a screen) has no prop to test.
        const state = propScope ? propStateOf(test, propScope) : null;
        if (state === null) return false;
        const slot = `${key}::${state.key}`;
        const value = evalLiteral(style, resolve, [slot]);
        if (value === NON_LITERAL) return false;
        found.set(state.key, state);
        out[slot] = value;
        return true;
      };
      // An `&&` entry is a variant. One the canvas cannot hold (a test on
      // two props, a computed style) is dropped and named, never allowed to
      // take the base style down with it.
      const conditional = (element: ts.Expression): boolean => {
        let e = element;
        while (ts.isParenthesizedExpression(e)) e = e.expression;
        if (
          !ts.isBinaryExpression(e) ||
          e.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken
        )
          return false;
        if (!variant(e.left, e.right)) dropped.push(e.getText(sf));
        return true;
      };

      let init = property.initializer;
      while (ts.isParenthesizedExpression(init)) init = init.expression;
      if (ts.isConditionalExpression(init)) {
        const base = evalLiteral(init.whenFalse, resolve, [key]);
        if (base === NON_LITERAL) return NON_LITERAL;
        if (!variant(init.condition, init.whenTrue))
          dropped.push(init.getText(sf));
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
