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
 * The transitions a stack screen can open with: the names the native stack
 * takes as its `animation` option. `default` is the platform's own.
 */
export const ROUTE_ANIMATIONS = [
  'default',
  'fade',
  'fade_from_bottom',
  'flip',
  'none',
  'simple_push',
  'slide_from_bottom',
  'slide_from_right',
  'slide_from_left',
  'ios_from_right',
  'ios_from_left',
] as const;

/** How a stack screen animates in and out (see {@link ROUTE_ANIMATIONS}). */
export type RouteAnimation = (typeof ROUTE_ANIMATIONS)[number];

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
  /**
   * The transition the screen opens and closes with. Valid only when the
   * parent navigator is a `stack`; absent means the platform's default.
   * Native only: a web stack has no screen transition.
   */
  animation?: RouteAnimation;
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
   *
   * On a route that enters a nested navigator the guard protects that whole
   * area — every screen under it (expo-router's `Stack.Protected` around the
   * group). The fallback must then lie outside the guarded area.
   */
  guard?: string;
  /**
   * Id of the route shown when {@link guard} fails. Required with a guard;
   * never the guarded route itself nor, for a navigator route, a route
   * inside the navigator it guards.
   */
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
 * Root of the bindings a designed tab bar's per-tab template reads
 * (`tab.label`, `tab.active`, `tab.index`). Each repeated tab provides its
 * own scope through a `@mapples/state` context kept apart from the data
 * state, like `route.*`, so a component's `props.*` stay readable inside it.
 */
export const TAB_NAMESPACE = 'tab';

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
  /**
   * The message key of the title in the project's locales document
   * (`home.title`, read as `t.home.title`). While the key resolves in the
   * active locale its message is shown; otherwise {@link title} is.
   */
  titleKey?: string;
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
/** Where a tabs navigator draws its bar — see `TabBarOptions.placement`. */
export type TabBarPlacement = 'bottom' | 'sidebar' | 'automatic';

export const TAB_BAR_PLACEMENTS: TabBarPlacement[] = [
  'bottom',
  'sidebar',
  'automatic',
];

/** The window width from which an `automatic` tab bar becomes a sidebar. */
export const TAB_BAR_SIDEBAR_MIN_WIDTH = 768;

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
  /**
   * The designed bar ({@link componentUuid}) lies over the screens instead of
   * below them: screens keep their full height and scroll underneath. Inert
   * on the stock and the native bar.
   */
  floating?: boolean;
  /**
   * Where the stock bar sits: along the `bottom` (the default), down the
   * left side as a `sidebar`, or `automatic` — a sidebar when the window is
   * at least {@link TAB_BAR_SIDEBAR_MIN_WIDTH} wide (a tablet, an unfolded
   * foldable) and a bottom bar otherwise. Inert on a designed bar
   * ({@link componentUuid}), which is drawn for the bottom edge. With
   * {@link native} the platform decides within the same preference
   * (expo-router `NativeTabs` `preferredPlacement`).
   */
  placement?: TabBarPlacement;
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
 * Icon fields accept an uploaded icon asset, `ref(icon:<uuid>:<name>)`, or a
 * built-in font glyph, `ref(glyph:<family>:<name>)` (see {@link buildGlyphRef}).
 *
 * @interface ScreenOptions
 */
export interface ScreenOptions extends Partial<HeaderOptions> {
  /** Tab bar icon — `ref(icon:<uuid>:<name>)` or `ref(glyph:<family>:<name>)`. */
  tabIcon?: string;
  /** Tab bar label override. */
  tabLabel?: string;
  /** Message key of the tab label; shown instead of {@link tabLabel} while it resolves. */
  tabLabelKey?: string;
  /** Drawer icon — `ref(icon:<uuid>:<name>)` or `ref(glyph:<family>:<name>)`. */
  drawerIcon?: string;
  /** Drawer label override. */
  drawerLabel?: string;
  /** Message key of the drawer label; shown instead of {@link drawerLabel} while it resolves. */
  drawerLabelKey?: string;
}

/**
 * A built-in font glyph used as a tab / drawer icon: the icon family's key as
 * `@mapples/ui` persists it (`ionicons`, `material-icons`, …) and the glyph's
 * name in that family — the same pair an `Icon` element renders
 * (`iconStyle` + `iconName`).
 *
 * @interface GlyphRef
 */
export interface GlyphRef {
  family: string;
  name: string;
}

const GLYPH_REF_PATTERN = /^ref\(glyph:([^:()]+):([^()]+)\)$/;

/**
 * The `ref(glyph:<family>:<name>)` string a {@link ScreenOptions} icon field
 * stores for a built-in glyph. The family is pinned in the ref (rather than
 * following the project's icon family) so the exported app can import the
 * one font it names.
 */
export const buildGlyphRef = (family: string, name: string): string =>
  `ref(glyph:${family}:${name})`;

/** The family and glyph of a `ref(glyph:…)` string, or `null` if it isn't one. */
export const parseGlyphRef = (value?: string): GlyphRef | null => {
  if (!value) return null;
  const match = GLYPH_REF_PATTERN.exec(value);
  return match ? { family: match[1], name: match[2] } : null;
};

/**
 * Whether a route's screen shows its navigator's header. The route's own
 * `visible` wins. Otherwise a route that enters a nested navigator shows
 * none — the nested navigator draws the header of the screen inside it, and
 * drawing the parent's too stacks two bars (`Auth` over `Sign in`) — and a
 * page route follows its navigator (shown unless the navigator turns it off).
 *
 * The one rule the canvas frame chrome and the exported app's generated
 * layouts (the `mapples` CLI mirrors it) both apply.
 */
export const routeHeaderVisible = (
  navigator: NavigatorNode,
  route: RouteNode,
): boolean =>
  route.options?.visible ??
  (route.target.kind === 'navigator'
    ? false
    : (navigator.options?.header?.visible ?? true));

/**
 * Reads a message of the project's locales document in the active locale:
 * the formatted text of a message key, `undefined` when the key does not
 * resolve (an unknown key, or a host with no locale runtime).
 */
export type MessageText = (key: string) => string | undefined;

/** The message of `key` when it resolves, else the literal text. */
const localizedText = (
  key: string | undefined,
  literal: string | undefined,
  text: MessageText | undefined,
): string | undefined => {
  const translated = key && text ? text(key) : undefined;
  return translated ?? literal;
};

/**
 * The title a route's screen shows in its header: the route's own, else the
 * navigator's, else the route name. At each level a title's message key
 * (`titleKey`) wins over its literal while `text` resolves it.
 */
export const routeTitle = (
  navigator: NavigatorNode,
  route: RouteNode,
  text?: MessageText,
): string =>
  localizedText(route.options?.titleKey, route.options?.title, text) ??
  localizedText(
    navigator.options?.header?.titleKey,
    navigator.options?.header?.title,
    text,
  ) ??
  route.name;

/**
 * The label a route's tab or drawer item shows ({@link routeItemLabel}): the
 * route's `tabLabel` / `drawerLabel` (its message key first, while `text`
 * resolves it), else the route name — never the header title, which a
 * navigator-wide title would otherwise put on every item.
 */
/**
 * The side of the window a tabs navigator's bar is drawn on, for a window
 * `width` points wide. One rule for the runtime, the canvas frame chrome and
 * the generated layouts, so a screen is designed against the bar it gets.
 */
export const tabBarSide = (
  tabBar: TabBarOptions | undefined,
  width: number,
): 'bottom' | 'left' => {
  if (!tabBar || tabBar.componentUuid) return 'bottom';
  if (tabBar.placement === 'sidebar') return 'left';
  if (tabBar.placement === 'automatic') {
    return width >= TAB_BAR_SIDEBAR_MIN_WIDTH ? 'left' : 'bottom';
  }
  return 'bottom';
};

export const routeItemLabel = (
  kind: 'tabs' | 'drawer',
  route: RouteNode,
  text?: MessageText,
): string =>
  (kind === 'tabs'
    ? localizedText(route.options?.tabLabelKey, route.options?.tabLabel, text)
    : localizedText(
        route.options?.drawerLabelKey,
        route.options?.drawerLabel,
        text,
      )) ?? route.name;
