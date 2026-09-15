// Translate "the file currently shows `local`, it should show `merged`" into
// surgical SidEdits for @mapples/sid-ast — so document changes land in a
// file without touching the code around the elements. Edit order matters:
// removals first (so a reparented sid is gone before its new parent inserts
// it), then shell updates, insertions, and reorders.

import { deepEqual, type RenderDomNode, type SidEdit } from '@mapples/sid-ast';

export interface IndexedNode {
  node: RenderDomNode;
  parentSid: string | null;
  index: number;
}

/** Every node of a tree by sid, with its parent and position. */
export function indexTree(
  root: RenderDomNode | null,
): Map<string, IndexedNode> {
  const map = new Map<string, IndexedNode>();
  const walk = (
    node: RenderDomNode,
    parentSid: string | null,
    index: number,
  ): void => {
    if (map.has(node.sid)) {
      throw new Error(`duplicate sid in tree: ${node.sid}`);
    }
    map.set(node.sid, { node, parentSid, index });
    node.children.forEach((child, i) => walk(child, node.sid, i));
  };
  if (root) walk(root, null, 0);
  return map;
}

type Sidecar = Pick<RenderDomNode, 'refProps' | 'dataProps' | 'actionProps'>;

/** `{refProps, dataProps, actionProps}` of a node, present only when non-empty. */
function sidecarOf(node: Sidecar): Sidecar {
  const out: Sidecar = {};
  if (node.refProps && Object.keys(node.refProps).length > 0)
    out.refProps = node.refProps;
  if (node.dataProps && Object.keys(node.dataProps).length > 0)
    out.dataProps = node.dataProps;
  if (node.actionProps && Object.keys(node.actionProps).length > 0) {
    out.actionProps = node.actionProps;
  }
  return out;
}

/** The same fields with `{}` standing in for absence — the comparison shape. */
function sidecarFilled(node: Sidecar): Required<Sidecar> {
  return {
    refProps: node.refProps ?? {},
    dataProps: node.dataProps ?? {},
    actionProps: node.actionProps ?? {},
  };
}

export function treeToEdits(
  local: RenderDomNode | null,
  merged: RenderDomNode | null,
): SidEdit[] {
  const lIdx = indexTree(local);
  const mIdx = indexTree(merged);

  if (local && merged && local.sid !== merged.sid) {
    // Root replaced: one subtree swap.
    return [{ kind: 'replaceSubtree', sid: local.sid, node: merged }];
  }

  const removes: SidEdit[] = [];
  const shells: SidEdit[] = [];
  const inserts: SidEdit[] = [];
  const moves: SidEdit[] = [];

  // Removals: local nodes that vanished from merged, or were reparented (their
  // new parent re-inserts the merged subtree). Only topmost removals needed.
  for (const [sid, lEntry] of lIdx) {
    const parentRemoved =
      lEntry.parentSid !== null &&
      (!mIdx.has(lEntry.parentSid) ||
        (lIdx.has(lEntry.parentSid) &&
          removedOrReparented(lEntry.parentSid, lIdx, mIdx)));
    if (parentRemoved) continue;
    if (removedOrReparented(sid, lIdx, mIdx)) {
      removes.push({ kind: 'removeNode', sid });
    }
  }

  // Is this local node (or an ancestor) getting removed/re-inserted wholesale?
  const insideRemoved = (sid: string): boolean => {
    let cursor: string | null = sid;
    while (cursor !== null) {
      if (removedOrReparented(cursor, lIdx, mIdx)) return true;
      cursor = lIdx.get(cursor)?.parentSid ?? null;
    }
    return false;
  };

  for (const [sid, mEntry] of mIdx) {
    const lEntry = lIdx.get(sid);
    if (lEntry && !insideRemoved(sid)) {
      const typeChanged = lEntry.node.type !== mEntry.node.type;
      const sidecarChanged = !deepEqual(
        sidecarFilled(lEntry.node),
        sidecarFilled(mEntry.node),
      );
      if (
        typeChanged ||
        sidecarChanged ||
        !deepEqual(lEntry.node.props, mEntry.node.props)
      ) {
        shells.push({
          kind: 'setProps',
          sid,
          props: mEntry.node.props,
          ...(typeChanged ? { type: mEntry.node.type } : {}),
          ...sidecarOf(mEntry.node),
        });
      }
    }
  }

  // Insertions + reorders per parent present in both trees.
  for (const [sid, mEntry] of mIdx) {
    const lEntry = lIdx.get(sid);
    if (!lEntry || insideRemoved(sid)) continue;
    const lKids = lEntry.node.children.map((c) => c.sid);
    const mKids = mEntry.node.children.map((c) => c.sid);

    for (const kid of mKids) {
      const isChildHereAlready =
        lKids.includes(kid) && !removedOrReparented(kid, lIdx, mIdx);
      if (!isChildHereAlready) {
        inserts.push({
          kind: 'insertChild',
          parentSid: sid,
          at: mKids.indexOf(kid),
          node: mIdx.get(kid)!.node,
        });
      }
    }

    const surviving = lKids.filter(
      (k) => mKids.includes(k) && !removedOrReparented(k, lIdx, mIdx),
    );
    const targetOrder = mKids.filter((k) => surviving.includes(k));
    if (!deepEqual(surviving, targetOrder)) {
      for (let i = 0; i < mKids.length; i++) {
        moves.push({
          kind: 'moveChild',
          parentSid: sid,
          sid: mKids[i]!,
          to: i,
        });
      }
    }
  }

  return [...removes, ...shells, ...inserts, ...moves];
}

function removedOrReparented(
  sid: string,
  lIdx: Map<string, IndexedNode>,
  mIdx: Map<string, IndexedNode>,
): boolean {
  const lEntry = lIdx.get(sid);
  const mEntry = mIdx.get(sid);
  if (!lEntry) return false;
  if (!mEntry) return true;
  return lEntry.parentSid !== mEntry.parentSid;
}
