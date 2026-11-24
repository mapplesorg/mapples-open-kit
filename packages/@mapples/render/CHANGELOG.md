# @mapples/render

## 2.1.1

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

- aabcfd4: **Breaking:** legacy compatibility code is removed; documents and code written by current tools are unaffected.
  - `@mapples/render`: `migrateLegacyIconNodes` is removed, and the canvas, Play and the AI tools no longer remap `Icon` nodes to `Vector` on load. The remap took every `Icon` whose `iconName` is a data binding (a component file's `<Icon iconName={iconName} />`) for a pre-rename SVG icon, so those glyphs drew the image placeholder and a canvas edit could save the `Vector` back. A document still holding a pre-rename uri `Icon` now draws the Icon placeholder until it is changed to `Vector`.
  - `@mapples/ui`: the hidden repeat-template `Select` element is removed (use `SelectField`, `SegmentedControl`, `ChipGroup` or `FlatList`), and `IconButton` drops its `uri` SVG mode: it always renders the themed glyph button from `iconName`.
  - `@mapples/navigation`: a navigation target must be a qualified `navigator:route` name (or a `pageUuid`); bare route names no longer resolve.
  - `@mapples/types`: the deprecated `NavigatorNode.canvas` placement and `NavigatorCanvasRect` are removed.
  - `@mapplesorg/canvas`: the unused single-page editor (`Canvas`, `CanvasView`, `DocumentHeader` and the components only they used) is removed, along with old device ids, the pre-grid screen order, the navigator-section free layout and the fabricated-node document repair.

- dd68ce2: No-code animations.
  - `@mapples/style`: a style can carry motion: CSS-style transitions (`transitionProperty`, `transitionDuration`, …) and keyframe animations (`animationName` with a preset from `ANIMATION_PRESETS` or keyframes written in place, `animationDuration`, `animationIterationCount`, …). `styled()` renders such an element through Reanimated's animated component and drops the motion keys when the OS asks for reduced motion. A style value may also be a selector value (`{ default, ':active' }`).
  - `@mapples/render`: interaction states. A `styled` key can name `$pressed`, `$hovered` or `$focused` after `::` (`style::$pressed`); `applyStateVariants` turns it into selector values, and `MapplesElement` applies it in generated apps.
  - `@mapples/types`, `@mapples/navigation`: `RouteNode.animation` sets the transition a stack screen opens with (`ROUTE_ANIMATIONS`); `validateNavigationDocument` reports `ANIMATION_NOT_STACK` and `ANIMATION_UNKNOWN`.
  - `@mapplesorg/canvas`, `@mapplesorg/schematics`: a Motion section in the Style tab, Pressed / Hovered / Focused in the State row, a Transition field for stack screens.
  - `@mapplesorg/ai-tools`: `set_element_style` and the subtree tools describe motion and take interaction states; new tool `set_route_animation`.

  **Breaking for apps on Reanimated 3:** `@mapples/style` now needs `react-native-reanimated` >= 4 as a peer dependency; `@mapples/dnd` moves its peers from Reanimated `~3.17.4` and gesture-handler `~2.24.0` to Reanimated >= 4 and gesture-handler >= 2.24; `@mapples/navigation` declares Reanimated >= 4. Apps created by the `mapples` CLI already have these.

- d6dc247: Style variants under a data state work in generated code. A page element whose style changes while a Creator state holds (`'style::<state>'` under a state such as `vars.count::gt::3`) was printed without the condition, so an app built from the file never applied it.
  - `@mapples/sid-ast`: an element with such a variant declares the state in a new `$states` attribute, `$states={{ '<state>': { condition: 'vars.count::gt::3', name: 'High' } }}`, next to the unchanged `'style::<state>'` entry. Generated output changes only for elements that have these variants; prop states still print as code (`[styles.card, isActive && styles.cardActive]`) and `style::$pressed` needs no declaration. `extract` returns the declared states in `states` (never as a node prop), so `extract(emit(dom))` gives the same tree and the same states. New `syncElementStates(source, states)` sets every element's `$states` from a document's states (`patch` runs it when given `states`), new exports `elementStates` and `STATES_ATTR`.
  - `@mapples/codegen`: `adoptPropConditions` takes only the file's prop states from the file; a data state stays as the document has it.
  - `@mapples/render`: `MapplesElement` takes `$states` and applies a `key::state` variant while that state's condition holds on the app's data state.

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

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

- 7339399: Designed navigator chrome. A tabs navigator's `TabBarOptions.componentUuid` and a drawer's `DrawerOptions.componentUuid` name a saved component that renders the bar or the drawer content, and `TabBarOptions.native` asks the exported app for expo-router's `NativeTabs`. `@mapples/render` carries the contract (`NavigatorChromeContext`, `useNavigatorChrome`): the navigator's routes as items with a label, an active flag and an icon renderer, plus `select`, `close` and the safe-area insets. Two new `@mapples/components` elements read it — `TabBarItems` (one tab per route, pill, labels, badges' tones) and `DrawerItems` (one row per route) — and show a notice when the component is not a navigator's design yet; `@mapples/components` now peers on `@mapples/render`. `@mapples/navigation` mounts a design through `TabBarHost` / `DrawerContentHost` (React Navigation's `tabBar` / `drawerContent`, reading only their props so an exported app uses them as-is) when `MapplesNavigation` is given the `chrome` map, and keeps `visible: false` working for a custom bar. The Creator canvas draws a designed tab bar on every screen frame with its measured height as the bottom inset, a platform-styled placeholder for a native bar, frames a chrome master on the components surface at the chrome's shape with the navigator's routes flowing in, and labels storyboard sections with their design. `create_navigator_chrome` creates and assigns a starter design; `set_navigator_options` accepts the new fields.
- a52e2ed: A `refProps` / `$refs` key may be a dotted path into a prop's data — `{ 'items.0.imageSource': 'ref(image:…)' }` gives the first list item its photo. New `applyRefProps(props, refs)` applies refs on copies of the arrays and objects along the path (a missing item sets nothing); `RenderComponent`, `MapplesElement` and the canvas render paths use it. The ai-tools `refProps` description tells the model about path keys.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.

### Patch Changes

- 53e3d58: State variants (`styled` keys like `style::pressed`) no longer wrap every slot in an array. A slot with no active variant reaches the component exactly as written; a slot with active variants becomes `[base, ...variants]` with every active one kept — two states on the same slot used to keep only the last key written. One helper, `applyStateVariants` (exported from `@mapples/render`), now backs the runtime's `useConditionalStyled`, the canvas's `useConditionalStyled` and its read-only `useStateVariants`.

## 1.3.0

### Minor Changes

- 6f3edc2: Icon/Vector split: `@mapples/ui`'s `Icon` now renders font glyphs from the `@react-native-vector-icons` families (declared as peer dependencies), resolving its default family from the project style config; the old uri-based SVG icon lives on as the new `Vector` component. `@mapples/style` adds a project-wide `icons` config to the theme, and `@mapples/render` remaps legacy uri `Icon` nodes to `Vector` on document load.

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

## 1.0.5

### Patch Changes

- 53fb55e: fix: update this handler
- 53fb55e: feat: introduce inlang feature\

## 1.0.4

### Patch Changes

- c5c0880: add state support for render

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
