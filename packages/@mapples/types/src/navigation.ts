/**
 * Navigation document schema — the JSON persisted in `Navigation.data`.
 *
 * The backend treats `Navigation.data` as opaque (the same way `Page.data` is
 * opaque and typed client-side). This module owns its shape: a single atomic
 * document that supports nesting, ordering, and per-navigator/per-screen
 * options. See the proposal §4 for the full rationale.
 *
 * @module navigation
 */

/**
 * The kind of navigator a {@link NavigatorNode} represents.
 *
 * - `stack` — push/pop screens with a header (cards, modals).
 * - `tabs` — bottom tab bar switching between sibling routes.
 * - `drawer` — side drawer switching between sibling routes.
 */
export type NavigatorType = 'stack' | 'tabs' | 'drawer';

/**
 * The root navigation document stored in `Navigation.data`.
 *
 * Navigators are held in a flat map keyed by id (mirroring how `RenderDom`
 * stores `childComponents`) so nesting is expressed by reference rather than
 * by physical containment, keeping reorder/move operations cheap.
 *
 * @interface NavigationDocument
 */
export interface NavigationDocument {
  /** Schema version. Always `1` for the current model. */
  version: 1;
  /** Id of the navigator that renders at the application root. */
  rootNavigatorId: string;
  /** Flat map of every navigator in the document, keyed by {@link NavigatorNode.id}. */
  navigators: Record<string, NavigatorNode>;
}

/**
 * A single navigator (stack, tabs, or drawer) and its ordered child routes.
 *
 * @interface NavigatorNode
 */
export interface NavigatorNode {
  /** Stable unique id, used as the key in {@link NavigationDocument.navigators}. */
  id: string;
  /** The kind of navigator. Determines which {@link NavigatorOptions} apply. */
  type: NavigatorType;
  /** Human-readable name, unique within the document; used as the route name. */
  name: string;
  /** Id of the route shown first. Defaults to the first entry of {@link routes}. */
  initialRouteId?: string;
  /** Child routes in display order (tab/drawer order, or stack base order). */
  routes: RouteNode[];
  /** Presentation/styling options scoped to this navigator. */
  options?: NavigatorOptions;
}

/**
 * A single route within a navigator — either a page leaf or a nested navigator.
 *
 * @interface RouteNode
 */
export interface RouteNode {
  /** Stable unique id for this route. */
  id: string;
  /** Route name, unique within the parent navigator. */
  name: string;
  /** What this route renders: a page leaf or a nested navigator. */
  target:
    | { kind: 'page'; pageUuid: string }
    | { kind: 'navigator'; navigatorId: string };
  /** How the screen is presented. Valid only when the parent navigator is a `stack`. */
  presentation?: 'card' | 'modal' | 'transparentModal';
  /** Per-screen option overrides (header, tab/drawer label & icon). */
  options?: ScreenOptions;
  /** Reserved for deep linking. No v1 UI. */
  path?: string;
  /** Reserved for a state condition guard. No v1 UI. */
  guard?: string;
}

/**
 * Navigator-level presentation options. Only the field matching the
 * navigator's {@link NavigatorType} is meaningful at runtime.
 *
 * @interface NavigatorOptions
 */
export interface NavigatorOptions {
  /** Header options — applies to `stack` navigators. */
  header?: HeaderOptions;
  /** Tab bar options — applies to `tabs` navigators. */
  tabBar?: TabBarOptions;
  /** Drawer options — applies to `drawer` navigators. */
  drawer?: DrawerOptions;
}

/**
 * Styling and behaviour of a stack navigator's header.
 *
 * Colour fields accept either a raw value or a theme reference of the form
 * `ref(theme:<uuid>:<name>)`.
 *
 * @interface HeaderOptions
 */
export interface HeaderOptions {
  /** Whether the header is shown. */
  visible?: boolean;
  /** Header title text. */
  title?: string;
  /** Header background — raw value or `ref(theme:<uuid>:<name>)`. */
  backgroundColor?: string;
  /** Tint applied to header buttons/icons. */
  tintColor?: string;
  /** Title text styling. */
  titleStyle?: { fontFamily?: string; fontSize?: number; color?: string };
  /** Whether the back button is shown. */
  backVisible?: boolean;
  /** Whether the header's bottom shadow/border is shown. */
  shadowVisible?: boolean;
}

/**
 * Styling and behaviour of a tabs navigator's tab bar.
 *
 * @interface TabBarOptions
 */
export interface TabBarOptions {
  /** Whether the tab bar is shown. */
  visible?: boolean;
  /** Tab bar background colour. */
  backgroundColor?: string;
  /** Tint for the active tab. */
  activeTintColor?: string;
  /** Tint for inactive tabs. */
  inactiveTintColor?: string;
  /** Whether tab labels are shown. */
  labelVisible?: boolean;
  /** Tab label text styling. */
  labelStyle?: { fontFamily?: string; fontSize?: number };
}

/**
 * Styling and behaviour of a drawer navigator.
 *
 * @interface DrawerOptions
 */
export interface DrawerOptions {
  /** Which edge the drawer opens from. */
  position?: 'left' | 'right';
  /** How the drawer animates relative to the screen. */
  drawerType?: 'front' | 'back' | 'slide';
  /** Drawer background colour. */
  backgroundColor?: string;
  /** Tint for the active drawer item. */
  activeTintColor?: string;
  /** Tint for inactive drawer items. */
  inactiveTintColor?: string;
  /** Drawer width in points. */
  width?: number;
}

/**
 * Per-screen option overrides. Extends {@link HeaderOptions} (each field
 * optional) and adds tab/drawer item presentation for the screen.
 *
 * Icon fields accept a reference of the form `ref(icon:<uuid>:<name>)`.
 *
 * @interface ScreenOptions
 */
export interface ScreenOptions extends Partial<HeaderOptions> {
  /** Tab bar icon — `ref(icon:<uuid>:<name>)`. */
  tabIcon?: string;
  /** Tab bar label override. */
  tabLabel?: string;
  /** Drawer icon — `ref(icon:<uuid>:<name>)`. */
  drawerIcon?: string;
  /** Drawer label override. */
  drawerLabel?: string;
}
