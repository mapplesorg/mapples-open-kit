// RenderDom -> JSX text. Deterministic: $sid first, then props sorted
// lexicographically; object literal keys sorted; strings single-quoted.

import { SIDECAR_FIELDS, type RenderDomNode } from './types';

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
): string {
  if (value === true) return name;
  if (typeof value === 'string')
    return `${name}="${value.replace(/\\/g, '\\\\').replace(/"/g, '&quot;')}"`;
  return `${name}={${printValue(value, '', exprAt)}}`;
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

/** `$refs` / `$data` / `$actions` attributes for a node's non-empty sidecar fields, in that order. */
function sidecarAttrs(node: RenderDomNode): [string, unknown][] {
  const attrs: [string, unknown][] = [];
  for (const [field, attr] of SIDECAR_FIELDS) {
    const value = node[field];
    if (value && Object.keys(value).length > 0) attrs.push([attr, value]);
  }
  return attrs;
}

interface Emittable {
  elementName: string;
  attrs: [string, unknown][];
  text: string | null;
}

/** Element name, ordered attribute list and text child for a node. */
export function emittable(node: RenderDomNode): Emittable {
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
    attrs.push(...sidecarAttrs(node));
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
    ...sidecarAttrs(node),
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
): string {
  const { attrs } = emittable(node);
  const styledAt = styledExprAt(node, options);
  const parts = attrs.map(([n, v]) =>
    printAttr(n, v, n === 'styled' ? styledAt : undefined),
  );
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

/** Full JSX for a subtree, indented. */
export function printNode(
  node: RenderDomNode,
  indent = '',
  options?: PrintOptions,
): string {
  const { elementName, text } = emittable(node);
  const attrsText = printAttrsText(node, options);
  const open = `${indent}<${elementName}${attrsText}`;
  if (node.children.length === 0 && text === null) return `${open} />`;
  const inner: string[] = [];
  if (text !== null) {
    inner.push(`${indent}  {${sq(text)}}`);
  }
  for (const child of node.children) {
    inner.push(printNode(child, indent + '  ', options));
  }
  return `${open}>\n${inner.join('\n')}\n${indent}</${elementName}>`;
}

/** Alias kept for API symmetry with extract(). */
export const printTree = printNode;
