// Public types for @mapples/sid-ast. This package is PURE: strings in, JSON
// out. No fs, no network, and no TypeScript AST types escape its API.

export interface RenderDomNode {
  sid: string; // nd_… | c_… (pre-push only)
  type: string; // 'View' | 'Text' | … | 'Custom'
  props: Record<string, unknown>;
  children: RenderDomNode[];
  /** Asset/data references, e.g. source: "ref(image:<uuid>:<name>)" (RFC-0001 §4.1). */
  refProps?: Record<string, string>;
  /** Data bindings per prop (Creator `dataProps`); carried as the `$data` JSX attribute. */
  dataProps?: Record<string, unknown>;
  /** Event actions per event key (Creator `actionProps`, e.g. a navigation segue); `$actions` in JSX. */
  actionProps?: Record<string, unknown>;
}

/** The JSON sidecar fields a node carries beside `props`, with their JSX attribute names. */
export const SIDECAR_FIELDS = [
  ['refProps', '$refs'],
  ['dataProps', '$data'],
  ['actionProps', '$actions'],
] as const;
export type SidecarField = (typeof SIDECAR_FIELDS)[number][0];

export interface Span {
  start: number;
  end: number;
}

export type ExtractWarningKind =
  | 'NON_LITERAL_PROP'
  | 'DUPLICATE_SID'
  | 'UNKNOWN_ELEMENT_WITH_SID'
  /** A component file whose shape `ensureInstanceStyled` does not rewrite. */
  | 'INSTANCE_STYLING'
  /**
   * A `$sid` element outside the file's first tree (another `return`, a
   * helper): the document has one root, so that tree is not read.
   */
  | 'MULTIPLE_ROOTS'
  /**
   * A style variant or show/hide guard whose test is not on one prop
   * (`a && b`): the canvas keeps the base style / always shows the element.
   */
  | 'UNSUPPORTED_CONDITION'
  /**
   * A `ref(…)` asset reference in a prop's literal data instead of `$refs`:
   * nothing resolves it there (a `$refs` key may be a dotted path into it).
   */
  | 'INLINE_ASSET_REF';

export interface ExtractWarning {
  kind: ExtractWarningKind;
  sid?: string;
  prop?: string;
  detail: string;
  /**
   * `info`: expected in hand-written code — the file is fine and nothing is
   * lost, the Creator just can't mirror it (an event handler the canvas
   * preview doesn't run). Omitted means `warning`: a value or a change did
   * not make it across.
   */
  severity?: 'info' | 'warning';
}

export interface ExtractResult {
  dom: RenderDomNode | null;
  warnings: ExtractWarning[];
  spans: Map<string, Span>;
  /**
   * Render states the file's prop tests declare, by state key — the
   * conditions its `style::<key>` variants render under
   * (`{ isActive: { name: 'isActive', condition: 'props.isActive::eq::true' } }`).
   */
  states: Record<string, RenderState>;
}

/** A document render state: what a `style::<key>` variant renders under. */
export interface RenderState {
  name: string;
  condition: string;
}

export interface ExtractOptions {
  /**
   * Module specifiers whose imports count as Mapples primitives (the element
   * name is then the RenderDom `type`). Default: ['@mapples/ui', '@mapples/components'].
   */
  primitiveModules?: readonly string[];
}

export interface PatchOptions extends ExtractOptions {
  /**
   * The document's render states. A `styled` variant under a state that
   * tests a component prop prints as that test (`isActive && {…}`) instead of
   * a literal `'style::isActive'` key.
   */
  states?: Record<string, RenderState>;
}

/** One surgical edit against a $sid subtree. Applied in order, re-analyzing between edits. */
export type SidEdit =
  | {
      kind: 'setProps';
      sid: string;
      /** Full desired props (canvas shape — for Custom nodes the full {name, importRef, layout, fallbackSize}). */
      props: Record<string, unknown>;
      type?: string;
      refProps?: Record<string, string>;
      dataProps?: Record<string, unknown>;
      actionProps?: Record<string, unknown>;
    }
  | { kind: 'removeNode'; sid: string }
  | { kind: 'insertChild'; parentSid: string; at: number; node: RenderDomNode }
  | { kind: 'moveChild'; parentSid: string; sid: string; to: number }
  | { kind: 'replaceSubtree'; sid: string; node: RenderDomNode };

export interface PatchResult {
  source: string;
  warnings: ExtractWarning[];
}
