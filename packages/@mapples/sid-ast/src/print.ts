// RenderDom -> JSX text. Deterministic: $sid first, then props sorted
// lexicographically; object literal keys sorted; strings single-quoted.

import { propOfCondition, propTestCode } from './propConditions.js';
import {
  SIDECAR_FIELDS,
  type RenderDomNode,
  type RenderState,
} from './types.js';

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function sq(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * An expression to print in place of the literal at `path` inside a value —
 * `styles.card` for the `style` key of a `styled` object — or undefined to
 * print the literal itself.
 */
export type ExprAt = (path: string[]) => string | undefined;

/** JS literal for a JSON value. */
export function printValue(
  value: unknown,
  indent = '',
  exprAt?: ExprAt,
  path: string[] = [],
): string {
  const expr = exprAt?.(path);
  if (expr !== undefined) return expr;
  if (value === null) return 'null';
  switch (typeof value) {
    case 'string':
      return sq(value);
    case 'number':
    case 'boolean':
      return JSON.stringify(value);
    case 'object': {
      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return (
          '[' +
          value
            .map((v, i) => printValue(v, indent, exprAt, [...path, String(i)]))
            .join(', ') +
          ']'
        );
      }
      const entries = Object.entries(value as Record<string, unknown>).filter(
        ([, v]) => v !== undefined,
      );
      if (entries.length === 0) return '{}';
      entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
      const body = entries
        .map(
          ([k, v]) =>
            `${IDENT_RE.test(k) ? k : sq(k)}: ${printValue(v, indent, exprAt, [...path, k])}`,
        )
        .join(', ');
      return `{ ${body} }`;
    }
    default:
      throw new Error(`cannot print non-JSON value of type ${typeof value}`);
  }
}

export function printAttr(
  name: string,
  value: unknown,
  exprAt?: ExprAt,
  states?: Record<string, RenderState>,
): string {
  if (value === true) return name;
  if (typeof value === 'string')
    return `${name}="${value.replace(/\\/g, '\\\\').replace(/"/g, '&quot;')}"`;
  if (name === 'styled' && states) {
    return `${name}={${printStyled(value, states, exprAt)}}`;
  }
  return `${name}={${printValue(value, '', exprAt)}}`;
}

/**
 * A `styled` object with its prop-state variants folded into the keys they
 * vary: `style` + `style::isActive` under `props.isActive::eq::true` prints
 * `style: [styles.card, isActive && styles.cardActive]` — the code the
 * parser reads the variant back from. Variants under any other state stay
 * literal `'style::key'` entries.
 */
function printStyled(
  value: unknown,
  states: Record<string, RenderState>,
  exprAt?: ExprAt,
): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return printValue(value, '', exprAt);
  }
  const record = value as Record<string, unknown>;
  const variants = new Map<string, [string, string][]>(); // key -> [slot, test]
  for (const [slot, v] of Object.entries(record)) {
    if (v === undefined) continue;
    const [key, stateKey] = slot.split('::');
    if (stateKey === undefined) continue;
    const state = states[stateKey];
    const test = state ? propTestCode(state.condition) : null;
    if (test === null) continue;
    const list = variants.get(key!) ?? [];
    list.push([slot, test]);
    variants.set(key!, list);
  }
  if (variants.size === 0) return printValue(value, '', exprAt);

  const folded = new Set(
    [...variants.values()].flatMap((list) => list.map(([slot]) => slot)),
  );
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(record)) {
    if (v !== undefined && !folded.has(k)) keys.add(k);
  }
  for (const k of variants.keys()) keys.add(k);
  const body = [...keys]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((k) => {
      const list = variants.get(k);
      const printed =
        record[k] === undefined
          ? undefined
          : printValue(record[k], '', exprAt, [k]);
      if (!list) return `${IDENT_RE.test(k) ? k : sq(k)}: ${printed}`;
      const parts = [
        ...(printed === undefined ? [] : [printed]),
        ...[...list]
          .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
          .map(
            ([slot, test]) =>
              `${test} && ${printValue(record[slot], '', exprAt, [slot])}`,
          ),
      ];
      const expr = parts.length === 1 ? parts[0]! : `[${parts.join(', ')}]`;
      return `${IDENT_RE.test(k) ? k : sq(k)}: ${expr}`;
    })
    .join(', ');
  return `{ ${body} }`;
}

export interface PrintOptions {
  /**
   * Print an expression instead of the literal for one key of a node's
   * `styled` — `styles.card` for a style hoisted into a dictionary. Return
   * undefined to print the literal.
   */
  styleRef?: (
    node: RenderDomNode,
    key: string,
    value: unknown,
  ) => string | undefined;
  /**
   * The document's render states: `styled` variants under a state that tests
   * a component prop print as that test (`isActive && styles.cardActive`).
   */
  states?: Record<string, RenderState>;
}

function styledExprAt(
  node: RenderDomNode,
  options?: PrintOptions,
): ExprAt | undefined {
  // A Custom (a linked component instance in file language) keeps its
  // `styled` among the layout props it prints as attributes.
  const styled =
    node.type === 'Custom'
      ? ((node.props.layout as Record<string, unknown> | undefined) ?? {})
          .styled
      : node.props.styled;
  if (!options?.styleRef || typeof styled !== 'object' || styled === null)
    return undefined;
  const record = styled as Record<string, unknown>;
  return (path) => {
    if (path.length !== 1) return undefined;
    const key = path[0]!;
    if (!(key in record)) return undefined;
    return options.styleRef!(node, key, record[key]);
  };
}

/**
 * The prop test a node renders under (`isActive` in `{isActive && <X/>}`):
 * its `_visible` binding when that binding is a condition on a component
 * prop. Null for any other node.
 */
export function visibilityGuard(node: RenderDomNode): string | null {
  const visible = node.dataProps?._visible as
    | { key?: unknown; active?: unknown }
    | undefined;
  if (!visible || visible.active !== true || typeof visible.key !== 'string')
    return null;
  return propOfCondition(visible.key) !== null &&
    propTestCode(visible.key) !== null
    ? visible.key
    : null;
}

/**
 * `$refs` / `$data` / `$actions` attributes for a node's non-empty sidecar
 * fields, in that order. `guarded`: the node prints inside its prop test, so
 * the `_visible` binding that test stands for stays out of `$data`.
 */
function sidecarAttrs(
  node: RenderDomNode,
  guarded: boolean,
): [string, unknown][] {
  const attrs: [string, unknown][] = [];
  const guard = guarded ? visibilityGuard(node) : null;
  for (const [field, attr] of SIDECAR_FIELDS) {
    let value = node[field];
    if (field === 'dataProps' && guard !== null && value) {
      const rest = { ...value };
      delete rest._visible;
      value = rest;
    }
    if (value && Object.keys(value).length > 0) attrs.push([attr, value]);
  }
  return attrs;
}

interface Emittable {
  elementName: string;
  attrs: [string, unknown][];
  text: string | null;
}

/**
 * Element name, ordered attribute list and text child for a node. `guarded`:
 * the node sits among JSX children, where a prop-test `_visible` prints as
 * `{test && <X/>}` rather than inside `$data`.
 */
export function emittable(node: RenderDomNode, guarded = false): Emittable {
  if (node.type === 'Custom') {
    const { name, importRef, layout, fallbackSize, ...rest } = node.props as {
      name?: unknown;
      importRef?: unknown;
      layout?: unknown;
      fallbackSize?: unknown;
    };
    if (typeof name !== 'string' || typeof importRef !== 'string') {
      throw new Error(`Custom node ${node.sid} is missing name/importRef`);
    }
    const layoutEntries = Object.entries(
      (layout as Record<string, unknown>) ?? {},
    );
    layoutEntries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const attrs: [string, unknown][] = [['$sid', node.sid], ...layoutEntries];
    // A linked Creator component carries no fallback: the canvas renders it.
    if (fallbackSize !== undefined) attrs.push(['$fallback', fallbackSize]);
    attrs.push(...sidecarAttrs(node, guarded));
    const restKeys = Object.keys(rest);
    if (restKeys.length > 0) {
      throw new Error(
        `Custom node ${node.sid} has unexpected props: ${restKeys.join(', ')}`,
      );
    }
    return { elementName: name, attrs, text: null };
  }

  const { children: textChild, ...props } = node.props;
  const asText = node.children.length === 0 && typeof textChild === 'string';
  if (!asText && textChild !== undefined) {
    // children that cannot render as a text child stay a plain attribute.
    (props as Record<string, unknown>).children = textChild;
  }
  const entries = Object.entries(props).filter(([, v]) => v !== undefined);
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const attrs: [string, unknown][] = [
    ['$sid', node.sid],
    ...entries,
    ...sidecarAttrs(node, guarded),
  ];
  return {
    elementName: node.type,
    attrs,
    text: asText ? (textChild as string) : null,
  };
}

/** The attribute text (leading space included) for a node's opening tag. */
export function printAttrsText(
  node: RenderDomNode,
  options?: PrintOptions,
  guarded = false,
): string {
  const { attrs } = emittable(node, guarded);
  const styledAt = styledExprAt(node, options);
  const parts = attrs.map(([n, v]) =>
    n === 'styled'
      ? printAttr(n, v, styledAt, options?.states)
      : printAttr(n, v),
  );
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

/**
 * JSX for one element and its subtree, indented, without a guard of its own.
 * `guarded`: the element sits among JSX children (see `emittable`).
 */
export function printElement(
  node: RenderDomNode,
  indent = '',
  options?: PrintOptions,
  guarded = false,
): string {
  const { elementName, text } = emittable(node, guarded);
  const attrsText = printAttrsText(node, options, guarded);
  const open = `${indent}<${elementName}${attrsText}`;
  if (node.children.length === 0 && text === null) return `${open} />`;
  const inner: string[] = [];
  if (text !== null) {
    inner.push(`${indent}  {${sq(text)}}`);
  }
  for (const child of node.children) {
    inner.push(printChild(child, indent + '  ', options));
  }
  return `${open}>\n${inner.join('\n')}\n${indent}</${elementName}>`;
}

/**
 * A JSX child: the element, wrapped in the prop test it renders under —
 * `{isActive && (<X … />)}` — when its `_visible` binding is one.
 */
export function printChild(
  node: RenderDomNode,
  indent = '',
  options?: PrintOptions,
): string {
  const guard = visibilityGuard(node);
  const test = guard === null ? null : propTestCode(guard);
  if (test === null) return printElement(node, indent, options, true);
  return `${indent}{${test} && (\n${printElement(node, indent + '  ', options, true)}\n${indent})}`;
}

/** Full JSX for a subtree rooted at `node`, indented. */
export function printNode(
  node: RenderDomNode,
  indent = '',
  options?: PrintOptions,
): string {
  return printElement(node, indent, options);
}

/** Alias kept for API symmetry with extract(). */
export const printTree = printNode;
