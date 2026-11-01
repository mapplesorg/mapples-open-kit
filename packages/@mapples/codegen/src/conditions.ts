// Prop conditions are the file's: a component decides in code what renders
// under `isActive` (`{isActive && <X/>}`, `style: [base, isActive && on]`),
// and the document only mirrors that so the canvas can show it. Before a
// document is diffed into a file, those parts are taken from the file — a
// document written before it learned them (or before this sync) must not
// strip a developer's guards and variants out of the code. The same holds
// for a prop the file passes on (`title={title}`): its `props.title` binding
// is the file's.

import {
  isPropBinding,
  propOfCondition,
  type RenderDomNode,
  type RenderState,
} from '@mapples/sid-ast';

import { indexTree } from './edits.js';

type States = Record<string, RenderState>;

export interface AdoptedConditions {
  tree: RenderDomNode;
  /** The document's other states, and the file's prop states. */
  states: States;
}

const isPropState = (states: States, key: string): boolean => {
  const state = states[key];
  return state !== undefined && propOfCondition(state.condition) !== null;
};

/** The node's bindings that read a prop as is (`title` → `props.title`). */
const propBindings = (node: RenderDomNode): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(node.dataProps ?? {}).filter(
      ([key, binding]) =>
        key !== '_visible' &&
        isPropBinding((binding as { key?: unknown } | undefined)?.key),
    ),
  );

const propVisible = (node: RenderDomNode): unknown => {
  const visible = node.dataProps?._visible as { key?: unknown } | undefined;
  return typeof visible?.key === 'string' &&
    propOfCondition(visible.key) !== null
    ? visible
    : undefined;
};

/** The `styled` record a node's style lives in — `layout.styled` for a Custom. */
const styledOf = (node: RenderDomNode): Record<string, unknown> | undefined => {
  const holder =
    node.type === 'Custom'
      ? (node.props.layout as Record<string, unknown> | undefined)
      : node.props;
  const styled = holder?.styled;
  return typeof styled === 'object' && styled !== null
    ? (styled as Record<string, unknown>)
    : undefined;
};

const withStyled = (
  node: RenderDomNode,
  styled: Record<string, unknown>,
): RenderDomNode['props'] =>
  node.type === 'Custom'
    ? {
        ...node.props,
        layout: {
          ...((node.props.layout as Record<string, unknown>) ?? {}),
          styled,
        },
      }
    : { ...node.props, styled };

/**
 * `tree` (the document, in file language) with every node the file also has
 * carrying the file's prop conditions: its prop-test `_visible` binding,
 * the props it passes on (`title={title}`) and its `key::state` style
 * variants under prop states. Nodes only the document has keep theirs.
 */
export function adoptPropConditions(
  tree: RenderDomNode,
  file: RenderDomNode | null,
  fileStates: States,
  docStates: States = {},
): AdoptedConditions {
  const fileNodes = indexTree(file);

  const adopt = (node: RenderDomNode): RenderDomNode => {
    const children = node.children.map(adopt);
    const fileNode = fileNodes.get(node.sid)?.node;
    if (!fileNode) return { ...node, children };

    const out: RenderDomNode = { ...node, children };

    const dataProps = { ...(node.dataProps ?? {}) };
    if (propVisible(node) !== undefined) delete dataProps._visible;
    const visible = propVisible(fileNode);
    if (visible !== undefined) dataProps._visible = visible;
    Object.assign(dataProps, propBindings(fileNode));
    if (Object.keys(dataProps).length > 0) out.dataProps = dataProps;
    else delete out.dataProps;

    const styled = styledOf(node);
    const fileStyled = styledOf(fileNode);
    const variants = Object.entries(fileStyled ?? {}).filter(([slot]) => {
      const stateKey = slot.split('::')[1];
      return stateKey !== undefined && isPropState(fileStates, stateKey);
    });
    if (styled || variants.length > 0) {
      const next: Record<string, unknown> = {};
      for (const [slot, value] of Object.entries(styled ?? {})) {
        const stateKey = slot.split('::')[1];
        if (stateKey !== undefined && isPropState(docStates, stateKey)) {
          continue;
        }
        next[slot] = value;
      }
      for (const [slot, value] of variants) next[slot] = value;
      out.props = withStyled(node, next);
    }
    return out;
  };

  const states: States = {};
  for (const [key, state] of Object.entries(docStates)) {
    if (propOfCondition(state.condition) === null) states[key] = state;
  }
  Object.assign(states, fileStates);

  return { tree: adopt(tree), states };
}
