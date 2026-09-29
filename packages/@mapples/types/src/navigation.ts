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
  /** Editor-only canvas preferences. Ignored by the runtime. */
  canvas?: NavigationCanvasSettings;
}

/**
 * Editor-only preferences about how the navigation is *drawn on the canvas*.
 * The runtime never reads this, the same way it never reads
 * {@link NavigatorNode.canvas} — it lives here so the choice travels with the
 * project rather than with one editor.
 *
 * @interface NavigationCanvasSettings
 */
export interface NavigationCanvasSettings {
  /**
   * Draw each screen's navigator chrome (headers, and the tab bar of a tabs
   * navigator it belongs to) on its canvas frame, inset from the design area
   * exactly as the running app insets it. Unset means on: a frame that hides
   * the chrome is claiming space the screen will not actually have.
   */
  chrome?: boolean;
}

/**
 * Editor-only world-space rectangle of a navigator's section on the Creator
 * canvas. The runtime ignores it entirely — it exists so the canvas can
 * persist where the section is drawn, the same way pages persist their frame
 * placement in `_canvasProps`.
 *
 * @interface NavigatorCanvasRect
 */
export interface NavigatorCanvasRect {
  /** World-space left edge. */
  x: number;
  /** World-space top edge. */
  y: number;
  /** Width in world units. */
  width: number;
  /** Height in world units. */
  height: number;
}

/**
 * Editor-only cell of a navigator's section on the Creator storyboard grid:
 * the column and row it occupies in its parent's grid (the canvas itself for
 * a top-level section). The runtime ignores it entirely — it exists so the
 * canvas can persist where the section sits, the way pages persist their
 * frame placement in `_canvasProps`.
 *
 * @interface StoryboardCell
 */
export interface StoryboardCell {
  /** Column in the parent's grid. Any integer — the grid has no edge. */
  col: number;
  /** Row in the parent's grid. */
  row: number;
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
  /** Editor-only storyboard cell. Ignored by the runtime. */
  cell?: StoryboardCell;
  /**
   * Editor-only canvas placement from before the storyboard grid. Ignored by
   * the runtime and by the Creator, kept so older documents still parse.
   *
   * @deprecated Sections sit in a {@link cell} now.
   */
  canvas?: NavigatorCanvasRect;
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
  /**
   * The route's path segment under its navigator — the exported app's
   * expo-router file segment (`profile`, `(auth)` for a group, `send-money`),
   * which the CLI reads and writes on sync. A `:token` (or `[token]`) segment
   * is a param — `product/:id` — that every navigate action to the route must
   * supply (see {@link routePathParams}) and the screen reads as
   * `route.<token>`. Absent: derived from the route name, no params.
   */
  path?: string;
  /**
   * Access guard: a condition in the grammar element visibility uses
   * (`dataProp::condition::value`, e.g. `vars.session.token::isNotEmpty::`)
   * that must hold for the screen to show. When it fails the navigator sends
   * the user to {@link guardFallbackRouteId} instead. Meant for "signed in"
   * style checks — a screen waiting for its data binds `api.<name>.loading`,
   * a guard on the response would bounce the user before the request settles.
   */
  guard?: string;
  /** Id of the route shown when {@link guard} fails. Required with a guard. */
  guardFallbackRouteId?: string;
  /**
   * An action emitted each time the screen gains focus, with the route's
   * params as its event value and merged into its data — typically a
   * `mapples:request` so the screen loads what it shows
   * (`/product/:id` → `GET /products/{id}` with `{id}` bound to `route.id`).
   */
  onEnter?: RouteEnterAction;
}

/**
 * The action a route emits on focus. The same shape an element's action prop
 * carries: the type, plus the literal payload the runtime merges into
 * `Action.payload.data` (a request's `requestId` and follow-ups).
 *
 * @interface RouteEnterAction
 */
export interface RouteEnterAction {
  type: string;
  staticData?: Record<string, unknown>;
}

/**
 * Root of every route-param binding (`route.id`). Params live in their own
 * `@mapples/state` context, like `vars.*` and `api.*`, so a nested data-state
 * provider never shadows them.
 */
export const ROUTE_NAMESPACE = 'route';

/**
 * Param segments of a {@link RouteNode.path}: `:token` as authored in the
 * Creator, or `[token]` as an expo-router file the CLI adopted.
 */
const ROUTE_PATH_TOKEN_PATTERN =
  /(?:^|\/):([A-Za-z_][A-Za-z0-9_]*)(?=\/|$)|(?:^|\/)\[([A-Za-z_][A-Za-z0-9_]*)\](?=\/|$)/g;

/**
 * The param names a route path declares, in order of first appearance —
 * `shop/:category/:id` → `['category', 'id']`. Empty without a path.
 */
export const routePathParams = (path?: string): string[] => {
  const names: string[] = [];
  for (const match of (path ?? '').matchAll(ROUTE_PATH_TOKEN_PATTERN)) {
    const name = match[1] ?? match[2];
    if (!names.includes(name)) names.push(name);
  }
  return names;
};

/** One path segment: a literal, an expo-router `(group)`, or a param. */
const ROUTE_SEGMENT =
  '(?:[A-Za-z0-9._-]+|\\([A-Za-z0-9._-]+\\)|:[A-Za-z_][A-Za-z0-9_]*|\\[[A-Za-z_][A-Za-z0-9_]*\\])';

const ROUTE_PATH_PATTERN = new RegExp(
  `^\\/?${ROUTE_SEGMENT}(?:\\/${ROUTE_SEGMENT})*\\/?$`,
);

/**
 * Whether a route path is well-formed: one or more segments, each a literal
 * (`[A-Za-z0-9._-]+`), a `(group)`, or a `:name` / `[name]` param. A leading
 * or trailing slash is tolerated (the CLI strips them).
 */
export const isValidRoutePath = (path: string): boolean =>
  ROUTE_PATH_PATTERN.test(path);

/**
 * Navigator-level presentation options. Only the field matching the
 * navigator's {@link NavigatorType} is meaningful at runtime.
 *
 * @interface NavigatorOptions
 */
export interface NavigatorOptions {
  /**
   * Header options. Every navigator type draws a header, so these apply to
   * all three — turning `visible` off is how a nested navigator stops
   * stacking a second header under its parent's.
   */
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
  /**
   * Whether the header is shown. Unset means shown — that is the navigator
   * default, and `resolveNavigatorHeader` in `@mapples/navigation` makes it
   * explicit so editors can present a plain on/off rather than a tri-state
   * that reads "off" while the header is up.
   */
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
  /**
   * A saved component that renders the bar instead of the stock one. The
   * design owns the look: `backgroundColor`, the tints and the label fields
   * are inert while this is set; `visible` still applies. The runtime mounts
   * the component as React Navigation's `tabBar` and hands it the routes
   * through the navigator-chrome context (`TabBarItems` reads them).
   * Mutually exclusive with {@link native}.
   */
  componentUuid?: string;
  /**
   * Render the exported app's bar with expo-router's `NativeTabs` (the
   * platform tab bar: liquid glass on iOS 26, Material on Android). Only the
   * exported app can honour it — the Creator's Play mode keeps the JavaScript
   * bar, and the canvas draws a platform-styled placeholder. Mutually
   * exclusive with {@link componentUuid}.
   */
  native?: boolean;
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
  /**
   * A saved component that renders the drawer's content instead of the stock
   * item list. `position`, `drawerType`, `width` and `backgroundColor` still
   * shape the drawer itself; the tints are inert. The runtime mounts the
   * component as React Navigation's `drawerContent` and hands it the routes
   * through the navigator-chrome context (`DrawerItems` reads them).
   */
  componentUuid?: string;
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
