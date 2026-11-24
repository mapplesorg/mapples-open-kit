# @mapples/state

## 2.1.1

### Patch Changes

- 56be467: Fixes and features for 2.1.1 (issues filed against 2.1.0).
  - `@mapples/style`: `StyledProps` accepts state variants next to each slot, typed like the slot: `'style::$pressed'`, `'style::$hovered'`, `'style::$focused'` and `'style::<state>'` for a `$states` condition (#565). New `useScrollPaging(name)`, `useScrollPagingReporter` and `requestScrollPage(name, page)`: the page and page count of a named paging scroll view.
  - `@mapples/ui`: a `GradientBackground`, and a `View` with `gradient`, round the gradient layer to the element's own corner radii, so `overflow: 'hidden'` is no longer needed for rounded corners (#569). `ScrollView` and `HorizontalScrollView` take `name`; with `pagingEnabled` they report their page (#567). On the web a paging scroll view snaps its pages itself instead of through react-native-web, which wraps every page in a view of its own: pages sized with `flex: 1` or a percentage came out as wide as their content, so a carousel was cut off and stopped between pages in Play and in a web build, and its pages stacked on the canvas (#563). New `scrollEffect` on `ScrollView` and `HorizontalScrollView` (#561): a literal `{ itemSize, initialItem, scale, sideScale, sideRotate, sideOpacity, sideTranslate, perspective, origin }` makes the items follow the scroll (a coverflow shelf), snaps item by item, centres the first and last item and opens on `initialItem`. The canvas draws it at rest on the initial item, Play and a web build run it from the DOM, native from the scroll offset in state. On the web `Svg` prefixes the ids its markup declares, and the references to them, with a prefix of its own: two drawings that both declared `id="c"` shared one id space, so one was clipped and filled by the other's definitions (#562). New `ButtonRowContext`: a `fullWidth` Button inside a row that provides it takes the row's remaining width (#570).
  - `@mapples/components`: a `fullWidth` Button (or `ButtonGroup`) fills a row `BottomActionBar` (#570). `PageControl` takes `target`, the `name` of a paging scroll view: the dots follow its swipe and page count, a dot press scrolls to that page, and `onValueChange` reports each page (#567). Overlays (`ActionSheet`, `BottomSheet`, `Dialog`, `Snackbar`) take the height of the screen they are on instead of at least the window's, so a bottom sheet on a tab screen ends above the tab bar and no row is hidden under it (#568); on the canvas and in Play they are still at least a device tall.
  - `@mapplesorg/schematics`: `Paging`, `Name` and the `Scroll effect` fields on V Scroll / H Scroll, `Follows scroll view` on Page Control.
  - Creator: the Share dialog has "Copy play link"; a share link with `?play=1` opens with Play already running (#564).
  - `@mapples/state`, `@mapples/style`: the duration parsers (`mapples:delay`, `parseMotionTime`) read the number with an unambiguous pattern; the old one backtracked polynomially on a long run of digits (#559). Same accepted values: `300`, `300ms`, `0.3s`, `.5s`.
  - `@mapplesorg/canvas`: a device capture (Play's screenshot, the template capture page) and the first frame of a clip are rasterised twice and the second pass is kept; Safari left the screen's photos out of the first (#557). The percentage check of the transform fields uses the same unambiguous number pattern.
  - `@mapplesorg/canvas`: a board of up to 40 frames renders every frame once (the ones in view first, the rest one at a time right after) and keeps them, instead of mounting a frame each time it comes into view and turning all of them into cards below 15% zoom. Panning and zooming no longer stutter on the mount of a screen. Bigger boards keep the windowing.
  - `@mapplesorg/canvas`: zooming no longer re-renders every frame of the board. A frame follows the zoom only where it draws it (the components variant, and the selected screen on the storyboard); the header's density lives in the header pieces, so the step where headers shed their chips re-renders those pieces only; the outline of a connection's target follows the zoom on its own; the storyboard's arrows and connection dots catch up as a transition.

## 2.1.0

### Patch Changes

- 5fdf9ed: Languages and translations for apps built with Mapples (#469).

  `@mapples/types`: the locales document (`LocalesDocument`: a default locale, the supported ones and a message table per locale), `validateLocalesDocument`, `matchLocale`, `isRtlLocale`, and the message format: an ICU subset (`{path}` placeholders, `plural`, `selectordinal`, `select`, `number`, `date`, `time`) with `parseMessage`, `formatMessage`, `formatValue` and `parseValueFormat`. `DataProp` gains an optional `format` (`number`, `number, currency/USD`, `date, long`) that writes the bound value for the active locale. A project without the document is single-language and behaves as before.

  `@mapples/state`: `LocaleProvider` (device locale, closest supported, default; `inherit` starts a session over the surrounding project), `LocaleActionHandler` for the new `mapples:setLocale` action, `LocaleDirection`, `useLocaleState` and `deviceLocales`. Bindings resolve `t.<key>` to the translated message (placeholders are binding paths) and `locale.current | language | direction | isRTL | default | supported` to the active locale.

  `@mapples/app`: `MapplesApp` and `MapplesRuntime` mount the locale runtime from `project.locales` (the CLI's `locales.ts`, resolved as `mapples::locales`), keep the user's choice in `variablesStorage`, take a `locale` prop that pins it, and lay the app out right-to-left for an RTL locale (`direction` style on native, `dir` on web; Android also records it in `I18nManager` for the next launch).

  `@mapples/render` exports `useIsRTL()`; `TopAppBar`, `Breadcrumbs`, `ProgressBar` and `Rating` in `@mapples/components` mirror by it, so they follow a locale switched at runtime.

  `@mapplesorg/canvas`: frames and Play render in the host's `LocaleProvider` locale and direction, the action editor offers "Set language", and `MessageExtractProvider` lets a host turn a literal text into a message key from the inspector. `@mapplesorg/schematics`: the `placeholder` of TextInput and TextField is bindable.

  `@mapplesorg/ai-tools`: `get_translations`, `add_locale`, `remove_locale`, `set_default_locale`, `set_translations`, `remove_translation` and `translate_project`; `add_connection` takes `action.kind: "setLocale"`; `ProjectContext.locales` lists a multilingual project's languages.

  Creator: a Translations panel (languages, texts per language, missing markers, JSON / CSV import and export, a locale preview for the canvas and Play), translation keys in the binding picker, and the same data in the share viewer and the Preview app.

- d2ce13d: Everything a hand-made motion design needs from project data (kit #538): easing curves and keyframes of the project's own, stagger, transforms, more gradients, new components and device actions.
  - `@mapples/style`:
    - A timing function may be a curve written as text, `cubic-bezier(0.3, 1.4, 0.5, 1)` (`y` may overshoot) or `steps(4)`, in `transitionTimingFunction`, `animationTimingFunction` and on a single keyframe. `styled()` turns it into Reanimated's easing, which its native CSS layer needs.
    - Motion tokens: `ThemeConfig.motion` holds the project's `easings` (`{ spring: 'cubic-bezier(…)' }`, used as `easing.spring`) and `keyframes` (named sets, played by `animationName` / `exitAnimationName` like a preset; a project set with a preset's name replaces it). Keyframes may name theme colours (`theme.primary.main`) and the playing element's own colour (`$color(0.55)`). `useMotionTokens`, `validateMotionTokens`, `resolveTimingFunction`, `isTimingFunctionText`.
    - New presets: `rise`, `pop`, `stampIn`, `dropIn` (enter) and `float`, `bob`, `pulseRing`, `shine`, `scanLine` (loop); `ANIMATION_PRESET_TIMING` names the duration and curve each is designed for.
    - `animationStagger` on a parent starts each child's animation that much later than the one before it (the rows of a `FlatList` too). `MotionStagger`, `staggerRowDelay`.
    - `resolveMotionStyle(style, { reducedMotion, tokens, staggerDelay, getColor })` replaces the positional `reducedMotion` argument.
  - `@mapples/types`: `Gradient` is `LinearGradient | RadialGradient | ConicGradient`.
  - `@mapples/ui`: `GradientBackground` and `View` paint radial and conic gradients with `react-native-svg` (a conic one with `repeat` draws rays).
  - `@mapples/state`: `mapples:delay` (`{ duration, then }`) and `DelayActionHandler`.
  - `@mapples/components`:
    - New components: `Marquee`, `Confetti`, `FlipCard`, `CodeScanner` (`expo-camera`, an optional peer; a pressable stand-in on the web).
    - New actions `mapples:haptic`, `mapples:copy`, `mapples:share`, handled by `DeviceActionHandler`; each takes a `then` follow-up. `expo-haptics` and `expo-clipboard` are optional peers. `@mapples/state` is now a peer.
    - `ProgressCircle` and `ProgressBar` take `animate`, `animateDelay`, `animateDuration`: the fill grows from empty when it appears.
  - `@mapples/app`: `MapplesRuntime` mounts `DelayActionHandler` and `DeviceActionHandler`.
  - `@mapples/codegen`: the four new component types import from `@mapples/components`.
  - `@mapples/fonts`: Anton (Regular), a condensed display face.
  - `@mapplesorg/canvas`:
    - A Transform section (move, scale, rotate, rotate X / Y, skew, perspective, origin, back face) and a border style (solid, dashed, dotted).
    - The Motion section takes a custom curve, lists the project's easing tokens and keyframe sets, writes each preset's own timing, and sets the stagger of a parent.
    - The Gradient section sets the kind (linear, radial, angular).
    - Actions: Haptic feedback, Copy to clipboard, Share and Wait, with chained "Then" steps.
    - `resolveProjectPackages` counts the packages an element's actions need.
  - `@mapplesorg/schematics`: the new components' schematics; packages `camera`, `haptics`, `clipboard` and `ACTION_PACKAGES`; `StyleFormType.Transform`; Transform and Motion on text, pressable, image, SVG and code elements; `childrenAsItems`.
  - `@mapplesorg/ai-tools`: `update_motion_tokens`; `add_connection` takes `haptic`, `copy`, `share`, `delay` and nested `then`; the motion hint covers curves, tokens, the new presets, stagger, transforms and border style; the gradient hint covers radial and conic.

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- 55454ef: A follow-up action written with staticData now runs with that payload, as one written with data does.
- 559db71: Sessions and data in a signed-in app: `mapples:clearResponses` forgets every `api.*` response on sign-out; `ApiDocument.session` declares the refresh request, so a 401 renews the session once and retries, and a refused refresh empties it; a request that runs again keeps its previous response while loading; a request chained after `mapples:setState` reads the written values; guards wait for persisted variables to load and an authored navigate wins over the guard of the screen being left; `mapples:if` chooses a follow-up by a condition, and array variables take `remove` and `toggleItem`; a bound `BarChart` draws empty until its request answers and tolerates null fields, and an element that fails to render is reported and left out instead of ending the app; the theme follows a variable (`MapplesApp themeVariable`) on every platform; re-importing a request keeps its state headers and data states, `--environment` adds a second environment with relative paths, and a bodiless response samples as `null`; `FlatList` data is optional and `createFetchTransport` takes the generated secrets as they are.

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- 35e9ba6: Creator behaviour runs in the exported app.
  - `@mapples/app`: `MapplesApp` mounts the behaviour runtime (`MapplesRuntime`) — action bus, project variables (`vars.*`) with the `mapples:setState` handler, the API runtime (`api.*`, real requests via `fetch` with secrets from `EXPO_PUBLIC_MAPPLES_SECRET_<NAME>`, or a custom `transport`) with the `mapples:request` handler, the focused route's params, and `RouterActionHandler`, which drives expo-router with the same `toNavigationCommand` semantics as Play (navigate pushes; guard redirects, `replace` and sign-in into a guarded area reset the history). It reads `mapples/navigation.ts`, `mapples/api.ts` and `mapples/variables.ts` through `mapplesResolver` (new `mapples::navigation|api|variables` modules). CLI-generated layouts wrap screens with `mapplesScreens(...)` (`MapplesScreen`: params, on-enter action, guard + fallback, page-scoped variables; `RouteGuard` for a route entering a nested navigator) and render tab/drawer icons with `RouteIcon`. New peers: `@mapples/action`, `@mapples/navigation`, `@mapples/request`, `@mapples/state`, `rxjs`; `expo-router` is no longer optional.
  - `@mapples/render`: `useElementBindings` / `useActionHandlers` — the one implementation of data bindings, `_visible`, asset refs and actions — shared by `RenderComponent` and the new `MapplesElement`, which `babel-plugin-mapples-sid` renders every element carrying `$data` / `$actions` / `$refs` through.
  - `@mapples/navigation`: exports `RouteScreen` / `RouteGuard`; a screen's blur no longer wipes the params the next focused screen already published (on-enter requests reading `route.*` could stall); Play's navigators take header visibility, titles and tab/drawer labels from the shared `routeHeaderVisible` / `routeTitle` / `routeItemLabel` (a route entering a nested navigator no longer draws a second header); `entersGuardFromFallback` also counts the guards on the nested initial route chain a navigate lands on, so signing in to a route whose nested area is guarded resets the history in Play and the exported app.
  - `@mapples/state`: `ActiveRouteState.releaseParams`.
  - `@mapples/types`: `routeHeaderVisible`, `routeTitle`, `routeItemLabel` — the header/title/label rules the canvas frame chrome and the generated layouts share (a route entering a nested navigator draws no header of its own).
  - `@mapples/style`: styled styles accept a `boxShadow` object `{ x, y, radius, color }` in their types, as the styler already rendered it.
  - `@mapples/sid-ast`: a newly added attribute (a binding's `$data`) goes right after the last attribute — no double space, and the space before `/>` stays.
  - `@mapplesorg/canvas`: frame chrome follows the shared header rule (no `Auth`/`Auth` double header); switching an action's type drops the previous type's `staticData` keys (no stale `pageUuid` on a set-variable action).

- 6f37bab: API responses move to their own `@mapples/state` context (`ApiStateContextProvider`, `useApiState`), so `api.*` bindings resolve inside a nested `StateProvider` — a list row, a scoped data state — the way `vars.*` does; `validateApiDocument` now rejects a state key outside the `api.` namespace (`STATE_KEY_NAMESPACE`, `API_NAMESPACE`) and no longer reads an environment variable's `{{name}}` as the path token `{name`; it also rejects a request name that can't be a binding-path segment (`REQUEST_NAME_INVALID`, `API_REQUEST_NAME_PATTERN`) and an empty path (`PATH_EMPTY`). `@mapples/request` performs calls through a pluggable `RequestTransport` (`transport` prop, `createFetchTransport`), which receives `auth` unresolved so a forwarding transport never holds a secret. The runtime no longer fails silently: an unknown `requestId`, a path token that resolves to nothing, an undefined `{{variable}}`, a relative path without a base URL and an unconfigured secret all throw (`onRequestError` receives the resolution errors), an unresolved `state` source is no longer sent as the string `N/A`, and `event` sources read the event's first argument instead of the `staticData`-merged payload. `RequestProvider` drops its `state` prop.
- b1b8560: Routes carry a flow of their own: a `path` with `:token` params (`/product/:id`), an `onEnter` action emitted on every focus, and an access `guard` with a fallback route. Params travel on the navigate action as literals or value sources (`data` reads the pressed list row, `state` any binding), land in a new `route.*` state namespace the screen binds, and reach root-mounted handlers through `ActiveRouteProvider` — so a request bound to `route.id` loads the product page. `resolveValueSource` is shared by the request and navigation runtimes, and the new `data` source kind reads an action's resolved data. The navigate action form gets one source field per route param, the AI catalog `set_route_path` / `set_route_guard` / `set_route_on_enter` and `add_connection` params.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.

## 1.3.0

### Minor Changes

- 9b97c94: Native canvases can bridge contexts across a portal boundary: `@mapples/dnd` exports `FrameSpaceContext` and its root pan gesture takes a single pointer so two-finger gestures reach the content; `@mapples/form` exports `FormContext`; `@mapples/state` exports `StateContext`.

## 1.2.2

### Patch Changes

- 92b5e73: A `dataProps` binding whose variable holds no value now resolves to nothing, so the prop falls back to the component default — it previously read the `'N/A'` sentinel, and a bound `Switch` rendered ON from a truthy string.

  `useFormFieldToggle` seeds from the stored field and subscribes to it: a field already stored as `true` renders on, and writes from elsewhere are picked up instead of being shadowed by the hook's own state.

## 1.2.1

### Patch Changes

- 6f3edc2: Runtime performance: `@mapples/form` scopes subscription clones to the subscribed subtree, filters notifications by path prefix and coalesces history writes during bursts; `@mapples/dnd` gains race-free drop registration, a monitor id index and coalesced layout broadcasts; `@mapples/state` and `@mapples/action` memoize their provider context values.

## 1.2.0

### Minor Changes

- 40751c7: Writable variables runtime: `@mapples/state` gains writable variables, action commands and `StateActionHandler` (and stops writing refs during render in `VariablesProvider`); `@mapples/types` adds API definition, variables types and their validators; `@mapples/render` supports the reserved `_visible` data binding for conditional visibility and wraps custom renderers in the state context; `@mapples/inlang` conditions accept numeric values.

## 1.1.2

### Patch Changes

- f2313c2: feat: introudce navigation component

## 1.1.1

### Patch Changes

- 8628ce2: Bump vesrions to match the system

## 1.1.0

### Minor Changes

- 77277bc: Update to rn 56

## 1.0.7

### Patch Changes

- a1151e5: fix: resolve state parsing issue

## 1.0.6

### Patch Changes

- 53fb55e: feat: introduce inlang feature\

## 1.0.5

### Patch Changes

- 0056c27: Resolve state parse issues

## 1.0.4

### Patch Changes

- c5c0880: add state handler

## 1.0.3

### Patch Changes

- 8763b36: Introduce referances

## 1.0.2

### Patch Changes

- e9657a1: chore:sync versions

## 1.0.1

### Patch Changes

- 09b7fd9: chore: bump version

## 1.0.0

### Major Changes

- e6bb8bd: 🎉 **Mapples Open Kit v1.0.0 - First Release!**

  We're excited to announce the first major release of Mapples Open Kit! This comprehensive toolkit provides everything you need to build powerful, interactive applications with React.

  ## What's Included
  - **@mapples/action** - Action management and state handling
  - **@mapples/dnd** - Drag and drop functionality with full TypeScript support
  - **@mapples/form** - Form management and validation utilities
  - **@mapples/render** - Flexible rendering system for dynamic content
  - **@mapples/state** - State management utilities and providers
  - **@mapples/style** - Styling system with theme support and utilities
  - **@mapples/types** - Comprehensive TypeScript definitions
  - **@mapples/ui** - Beautiful, accessible UI components

  ## Key Features

  ✨ **TypeScript First** - Full TypeScript support across all packages
  🎨 **Modern Design** - Clean, accessible components with customizable themes
  🔧 **Developer Experience** - Intuitive APIs and comprehensive documentation
  📦 **Modular Architecture** - Use only what you need, when you need it
  🚀 **Performance Optimized** - Built with performance and bundle size in mind

  This release establishes the foundation for the Mapples ecosystem. We can't wait to see what you build with it!

  ***

  _This is a major release introducing the initial stable API. Future releases will maintain backward compatibility while adding new features and improvements._
