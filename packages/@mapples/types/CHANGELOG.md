# @mapples/types

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

- 094ce71: The camera permission is set per project:
  - The packages document can carry `permissions.camera`, the project's own prompt text, and each resolved entry an `expoPluginOptions` object (options per plugin in `expoPlugins`). Both are optional, so older documents and older CLIs are unchanged.
  - The `camera` package registers `expo-camera` with `microphonePermission: false` and `recordAudioAndroid: false`, since neither CodeScanner nor CameraView records sound, and with `cameraPermission` set to the project's text. With no text of its own, the text is derived from the elements that use the camera, e.g. "$(PRODUCT_NAME) uses the camera to scan QR codes and barcodes."
  - Creator → Project settings → Packages shows the text field on the Camera row.

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

- dcfd14b: Foldable phones. The device presets gain iPhone Duo, Galaxy Z Fold8 and Galaxy Z Flip8, each with two viewports: unfolded (the inner screen) and folded (the outer one). A frame stores the folded posture next to its device (`frame.posture`); frames without one, and every frame saved before, are unchanged. The canvas shows a posture picker beside the device picker for a foldable, Play draws each posture's hardware with the crease of the inner screen and has a Folded switch under the device, beside Bezels, and the share viewer and template preview offer the same devices and postures.

  `@mapples/style` exports `useHinge()`, `HingeProvider` and the `Hinge` type, shaped as `expo-hinge` reports the hinge. `useHinge()` returns `null` until a `HingeProvider` supplies a value: an app passes it `expo-hinge`'s `useHinge()`, and Play passes the played device's posture (closed at 0° folded, fully open at 180° unfolded).

  AI: `DeviceInfo` has an optional `posture`, `devicePresets` lists a foldable once per posture, and `set_frame_device` and `create_page` accept `posture`.

  iPhone Duo follows Apple's and Expo's guides: both postures report an 84 pt right safe-area inset for the system rail (top 0, bottom 34), and Play draws the camera, clock and status icons down that rail. The folded front is drawn with its hinge spine, square hinge corners and corner camera.

  `@mapples/navigation` keeps every page inside the left and right safe-area insets (`RouteScreen`), so a phone in landscape or the iPhone Duo's rail no longer covers page content. Pages on devices without side insets are unchanged.

  Tab navigators have a `tabBar.placement`: `bottom` (default), `sidebar` (down the left side) or `automatic` (a sidebar from 768 pt of width, a bottom bar below). It moves the stock bar only; a designed bar stays at the bottom. The navigator inspector has a Placement field, `set_navigator_options` accepts it, and a canvas frame leaves the bottom bar out when the bar is a sidebar (the sidebar itself is not drawn on the frame yet).

  Vertical bar (Apple's "Designing for iPhone Duo"): `@mapples/navigation` exports `VerticalBarProvider`, `useVerticalBar`, `RailTabBar` and `RailBackButton`. Under a `VerticalBarProvider` a tabs navigator draws its stock bar as a column of icons at the bottom of the device's rail instead of along the bottom of the screen (a designed bar and `placement: 'sidebar'` keep their place), and with `navigation: true` the stack and tab headers are left out and a pushed stack screen gets its back button at the top of the rail. Play provides the bar for iPhone Duo in both postures; nothing changes where no provider is mounted. The unfolded iPhone Duo is drawn without a camera cutout: the inner camera is hidden until it is in use.

- aabcfd4: **Breaking:** legacy compatibility code is removed; documents and code written by current tools are unaffected.
  - `@mapples/render`: `migrateLegacyIconNodes` is removed, and the canvas, Play and the AI tools no longer remap `Icon` nodes to `Vector` on load. The remap took every `Icon` whose `iconName` is a data binding (a component file's `<Icon iconName={iconName} />`) for a pre-rename SVG icon, so those glyphs drew the image placeholder and a canvas edit could save the `Vector` back. A document still holding a pre-rename uri `Icon` now draws the Icon placeholder until it is changed to `Vector`.
  - `@mapples/ui`: the hidden repeat-template `Select` element is removed (use `SelectField`, `SegmentedControl`, `ChipGroup` or `FlatList`), and `IconButton` drops its `uri` SVG mode: it always renders the themed glyph button from `iconName`.
  - `@mapples/navigation`: a navigation target must be a qualified `navigator:route` name (or a `pageUuid`); bare route names no longer resolve.
  - `@mapples/types`: the deprecated `NavigatorNode.canvas` placement and `NavigatorCanvasRect` are removed.
  - `@mapplesorg/canvas`: the unused single-page editor (`Canvas`, `CanvasView`, `DocumentHeader` and the components only they used) is removed, along with old device ids, the pre-grid screen order, the navigator-section free layout and the fabricated-node document repair.

- ea76bd9: Navigation texts can be translated. `HeaderOptions.titleKey` and `ScreenOptions.tabLabelKey` / `drawerLabelKey` name a message of the project's locales document (`home.title`, read as `t.home.title`); while the key has a message in the active locale it is shown instead of `title` / `tabLabel` / `drawerLabel`, which stay as the text of a single-language project and the fallback. `routeTitle` and `routeItemLabel` take an optional `MessageText` reader, and `@mapples/state` exports `useMessageText()`, which reads a message key the way a `t.*` binding does. `@mapples/navigation` resolves the keys in every navigator, so headers, tab bars and drawers follow a locale switch; the Creator draws them on the canvas in the previewed language, the navigator inspector picks the key from the project's messages, and the AI navigation tools accept the three fields. The Preview app's single-screen view now provides the project's locales, so `t.*` texts are translated there as in Full flow.
- dd68ce2: No-code animations.
  - `@mapples/style`: a style can carry motion: CSS-style transitions (`transitionProperty`, `transitionDuration`, …) and keyframe animations (`animationName` with a preset from `ANIMATION_PRESETS` or keyframes written in place, `animationDuration`, `animationIterationCount`, …). `styled()` renders such an element through Reanimated's animated component and drops the motion keys when the OS asks for reduced motion. A style value may also be a selector value (`{ default, ':active' }`).
  - `@mapples/render`: interaction states. A `styled` key can name `$pressed`, `$hovered` or `$focused` after `::` (`style::$pressed`); `applyStateVariants` turns it into selector values, and `MapplesElement` applies it in generated apps.
  - `@mapples/types`, `@mapples/navigation`: `RouteNode.animation` sets the transition a stack screen opens with (`ROUTE_ANIMATIONS`); `validateNavigationDocument` reports `ANIMATION_NOT_STACK` and `ANIMATION_UNKNOWN`.
  - `@mapplesorg/canvas`, `@mapplesorg/schematics`: a Motion section in the Style tab, Pressed / Hovered / Focused in the State row, a Transition field for stack screens.
  - `@mapplesorg/ai-tools`: `set_element_style` and the subtree tools describe motion and take interaction states; new tool `set_route_animation`.

  **Breaking for apps on Reanimated 3:** `@mapples/style` now needs `react-native-reanimated` >= 4 as a peer dependency; `@mapples/dnd` moves its peers from Reanimated `~3.17.4` and gesture-handler `~2.24.0` to Reanimated >= 4 and gesture-handler >= 2.24; `@mapples/navigation` declares Reanimated >= 4. Apps created by the `mapples` CLI already have these.

- b62a721: `pluralCategories(locale, ordinal?)` names the plural categories a language distinguishes (`one`, `few`, `many`, `other`, …), cardinal or ordinal, through the same `Intl.PluralRules` (or the `intl-pluralrules` implementation on Hermes) the message formatter uses. The Creator's Translations table uses it to warn when a translated plural lacks a category of its language.
- dcc48bf: Plural and ordinal messages work in iOS and Android apps. The app's JavaScript engine (Hermes) has no `Intl.PluralRules`, so `{n, plural, …}` and `{n, selectordinal, …}` threw there; `@mapples/types` now uses the `intl-pluralrules` implementation when the engine has none, and the engine's own where it exists. `intl-pluralrules` is a new dependency. Known limit: Hermes on iOS ignores `notation: 'compact'`, so the `compact` number format prints the full number there.

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- cb10390: The canvas previews one saved data state at a time (Loading, Success, Error or All), can hide components it can't draw, calls the API only in Develop with Live data on, and keeps the sample when a live call fails. Adds ApiRequest.states and RequestProvider's sampleOnFailure and stateOverride.
- 559db71: Sessions and data in a signed-in app: `mapples:clearResponses` forgets every `api.*` response on sign-out; `ApiDocument.session` declares the refresh request, so a 401 renews the session once and retries, and a refused refresh empties it; a request that runs again keeps its previous response while loading; a request chained after `mapples:setState` reads the written values; guards wait for persisted variables to load and an authored navigate wins over the guard of the screen being left; `mapples:if` chooses a follow-up by a condition, and array variables take `remove` and `toggleItem`; a bound `BarChart` draws empty until its request answers and tolerates null fields, and an element that fails to render is reported and left out instead of ending the app; the theme follows a variable (`MapplesApp themeVariable`) on every platform; re-importing a request keeps its state headers and data states, `--environment` adds a second environment with relative paths, and a bodiless response samples as `null`; `FlatList` data is optional and `createFetchTransport` takes the generated secrets as they are.
- 456c88f: A request's follow-up action can read the response through an event source, and a header read from state is left out when its value is empty.
- 7aa4590: ApiRequest.headerValues sends headers read when the request runs, such as a signed-in user's token.

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

- 04e6583: `LiveHelloFrame.agent`: the live agent-session lease as a v2 `agent` frame, or null when none is live. Editor and CLI sockets only; absent from viewers and from hubs that predate it.
- 7afa74c: Live hub: the canvas-api WebSocket's wire types (`@mapples/types` live.ts), a `CanvasHost` service so the Creator commits to the droplet with Lambda as the bypass, and chat protocol `mapples-ai/3` — session-scoped, resumable turns with seq-numbered frames, rooms, and the design streams over the socket.
- b1b8560: Header options now apply to every navigator type, and their default is explicit. A tabs or drawer navigator draws a header of its own, but only a stack's options were mapped — so a navigator nested in a stack always stacked a second header under its parent's with nothing that could turn it off. `resolveNavigatorHeader` and `navigatorHeaderVisible` expose the navigator default (`visible` unset means shown), so an editor can present a plain on/off instead of a tri-state that reads "off" while the header is up; route-level `visible` stays tri-state, because unset there means "inherit the navigator". `NavigationDocument.canvas` carries editor-only canvas preferences, ignored by the runtime the same way `NavigatorNode.canvas` is.
- 7339399: Designed navigator chrome. A tabs navigator's `TabBarOptions.componentUuid` and a drawer's `DrawerOptions.componentUuid` name a saved component that renders the bar or the drawer content, and `TabBarOptions.native` asks the exported app for expo-router's `NativeTabs`. `@mapples/render` carries the contract (`NavigatorChromeContext`, `useNavigatorChrome`): the navigator's routes as items with a label, an active flag and an icon renderer, plus `select`, `close` and the safe-area insets. Two new `@mapples/components` elements read it — `TabBarItems` (one tab per route, pill, labels, badges' tones) and `DrawerItems` (one row per route) — and show a notice when the component is not a navigator's design yet; `@mapples/components` now peers on `@mapples/render`. `@mapples/navigation` mounts a design through `TabBarHost` / `DrawerContentHost` (React Navigation's `tabBar` / `drawerContent`, reading only their props so an exported app uses them as-is) when `MapplesNavigation` is given the `chrome` map, and keeps `visible: false` working for a custom bar. The Creator canvas draws a designed tab bar on every screen frame with its measured height as the bottom inset, a platform-styled placeholder for a native bar, frames a chrome master on the components surface at the chrome's shape with the navigator's routes flowing in, and labels storyboard sections with their design. `create_navigator_chrome` creates and assigns a starter design; `set_navigator_options` accepts the new fields.
- 35e9ba6: Guards on navigator routes, built-in glyph tab icons, and storyboard placement fixes (RC #16, #20, #21, #22, #33, #34).
  - `@mapples/types`: a guard on a route that enters a nested navigator protects the whole section; the validator rejects a fallback inside the guarded section (`navigatorRouteIds`). Tab / drawer icons accept a built-in glyph, `ref(glyph:<family>:<name>)` (`buildGlyphRef` / `parseGlyphRef`), besides an icon asset.
  - `@mapples/navigation`: navigator routes honour their guard (`RouteGuard`); guard redirects reset the history instead of pushing (`replace` on `mapples:navigate`), and navigating from a guard's fallback into the area it guards (sign in → signed-in area) resets it too, so no back arrow leads into or out of a protected area. `ref(glyph:…)` icons render through the host's registered `Icon` component.
  - `@mapples/components`: a `TabBarItems` / `BottomNavigationBar` item without an icon is a label-only tab (pill behind the label) instead of an empty pill.
  - `@mapplesorg/canvas`: frames and designed bars draw glyph tab icons; a stock bar's tab without an icon is label-only, not a grey square; the frame tab bar no longer asks the project typography for the editor's `caption` / `overline` variants; guarded sections get a "Guarded" chip and an amber arrow to their fallback; placing a section or screen from the palette commits the drawn cells of its container, so the new item lands where it was clicked instead of pushing unplaced neighbours around; zoom-to-fit includes sections; `IconNameGrid` is exported.
  - `@mapplesorg/ai-tools`: `set_route_guard` covers navigator routes; `set_route_options` takes glyph refs for `tabIcon` / `drawerIcon`.

- 6f37bab: API responses move to their own `@mapples/state` context (`ApiStateContextProvider`, `useApiState`), so `api.*` bindings resolve inside a nested `StateProvider` — a list row, a scoped data state — the way `vars.*` does; `validateApiDocument` now rejects a state key outside the `api.` namespace (`STATE_KEY_NAMESPACE`, `API_NAMESPACE`) and no longer reads an environment variable's `{{name}}` as the path token `{name`; it also rejects a request name that can't be a binding-path segment (`REQUEST_NAME_INVALID`, `API_REQUEST_NAME_PATTERN`) and an empty path (`PATH_EMPTY`). `@mapples/request` performs calls through a pluggable `RequestTransport` (`transport` prop, `createFetchTransport`), which receives `auth` unresolved so a forwarding transport never holds a secret. The runtime no longer fails silently: an unknown `requestId`, a path token that resolves to nothing, an undefined `{{variable}}`, a relative path without a base URL and an unconfigured secret all throw (`onRequestError` receives the resolution errors), an unresolved `state` source is no longer sent as the string `N/A`, and `event` sources read the event's first argument instead of the `staticData`-merged payload. `RequestProvider` drops its `state` prop.
- b1b8560: Routes carry a flow of their own: a `path` with `:token` params (`/product/:id`), an `onEnter` action emitted on every focus, and an access `guard` with a fallback route. Params travel on the navigate action as literals or value sources (`data` reads the pressed list row, `state` any binding), land in a new `route.*` state namespace the screen binds, and reach root-mounted handlers through `ActiveRouteProvider` — so a request bound to `route.id` loads the product page. `resolveValueSource` is shared by the request and navigation runtimes, and the new `data` source kind reads an action's resolved data. The navigate action form gets one source field per route param, the AI catalog `set_route_path` / `set_route_guard` / `set_route_on_enter` and `add_connection` params.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 5300dba: The pages canvas is now an unbounded grid. Every navigator holds its routes in cells of its own grid, and the canvas itself holds the root section, detached sections and unrouted screens the same way; a column is as wide as its widest item, a row as tall as its tallest, with a constant gap between any two, so a device swap resizes a frame and shifts its neighbours without touching the spacing. Dragging a frame or section label lifts it out of the grid: the drop slot snaps to the column and row under the pointer — left of, above or beyond everything placed so far included — the row it lands in moves over to make room, and release stores the cell (`_canvasProps.frame.col/row` on a page, `cell` on a navigator, the new `StoryboardCell` type) and moves the route to match the picture; Escape springs it back. Items without a stored cell flow into the first free cells, four across. Section resize handles, stored section rects and the `layout_storyboard` AI tool are gone; `onCreateSection` takes the cell and a route index, `onSetSectionCell` is new, `onAssignPage` / `onReparentSection` / `onCreateScreen` carry a route index, and `create_page` no longer takes `x`/`y`. The components canvas keeps its free layout.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.

## 1.3.0

### Minor Changes

- bc9d13e: Project packages: `@mapples/types` adds the packages document contract (`PackagesDocument` — the
  enabled package ids plus the resolved install list the CLI reads — with a structural validator that
  mirrors the variables document). `@mapples/ui` makes every `@react-native-vector-icons` pack,
  `react-native-qrcode-svg`, `jsbarcode`, `expo-linear-gradient` and `expo-video` optional peer
  dependencies resolved with a try-wrapped require (Metro `allowOptionalDependencies`): a consumer
  installs only what its project uses, and a family or runtime whose package is missing throws a
  descriptive error at render instead of drawing a placeholder. `expo-image` and `expo-video` are
  declared as peers.

## 1.2.0

### Minor Changes

- 40751c7: Writable variables runtime: `@mapples/state` gains writable variables, action commands and `StateActionHandler` (and stops writing refs during render in `VariablesProvider`); `@mapples/types` adds API definition, variables types and their validators; `@mapples/render` supports the reserved `_visible` data binding for conditional visibility and wraps custom renderers in the state context; `@mapples/inlang` conditions accept numeric values.

## 1.1.2

### Patch Changes

- 6150aa1: Update typography handling logic and resolve minor isssue

## 1.1.1

### Patch Changes

- f2313c2: feat: introudce navigation component

## 1.1.0

### Minor Changes

- 77277bc: Update to rn 56

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
