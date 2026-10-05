import { createContext, useContext } from 'react';

/**
 * The tab a designed tab bar's per-tab template is rendering for — what the
 * `tab.*` bindings read (`tab.label`, `tab.active`, `tab.index`).
 */
export interface TabScope {
  /** Host-opaque identity of the tab's route. */
  routeId: string;
  /** The label the tab shows. */
  label: string;
  /** Whether the tab is the focused one. */
  active: boolean;
  /** Position of the tab in the bar, from 0. */
  index: number;
  /** How many tabs the bar has. */
  count: number;
}

/**
 * Context holding the tab an element is repeated for. Kept apart from the
 * data-state context, like the route params, so a component's own state
 * (`props.*`) stays readable inside the template. Defaults to `null`: outside
 * a repeated tab the bindings fall through to their `altValue`.
 */
const TabScopeContext = createContext<TabScope | null>(null);

export const TabScopeProvider = TabScopeContext.Provider;

/** The tab the element is repeated for, or `null` outside a tab template. */
export const useTabScope = (): TabScope | null => useContext(TabScopeContext);

export default TabScopeContext;
