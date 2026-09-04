import { RenderComponentType, RenderDom } from '../types';

/**
 * Documents saved before the Icon → Vector rename persist uri-based nodes as
 * `type: 'Icon'` — the type that now belongs to the font-glyph Icon component.
 * Remap those legacy nodes to `Vector` so they keep rendering as SVGs.
 *
 * Only legacy nodes migrate: a node owned by the new Icon component always
 * carries `iconName` in its props (its initialProps guarantee it), while the
 * uri-based component never did.
 *
 * Mutates and returns the given dom — call it on a freshly cloned or fetched
 * document, never on a live Form document.
 *
 * @public
 */
export const migrateLegacyIconNodes = <T extends RenderDom>(dom: T): T => {
  const visit = (node: RenderComponentType) => {
    if (node.type === 'Icon' && !(node.props && 'iconName' in node.props)) {
      node.type = 'Vector';
    }
    Object.values(node.childComponents ?? {}).forEach(visit);
  };
  if (dom?.root) {
    visit(dom.root);
  }
  return dom;
};
