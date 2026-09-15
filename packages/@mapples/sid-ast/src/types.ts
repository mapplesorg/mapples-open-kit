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
  | 'UNKNOWN_ELEMENT_WITH_SID';

export interface ExtractWarning {
  kind: ExtractWarningKind;
  sid?: string;
  prop?: string;
  detail: string;
}

export interface ExtractResult {
  dom: RenderDomNode | null;
  warnings: ExtractWarning[];
  spans: Map<string, Span>;
}

export interface ExtractOptions {
  /**
   * Module specifiers whose imports count as Mapples primitives (the element
   * name is then the RenderDom `type`). Default: ['@mapples/ui'].
   */
  primitiveModules?: readonly string[];
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
