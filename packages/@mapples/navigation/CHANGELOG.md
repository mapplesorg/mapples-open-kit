# @mapples/navigation

## 2.1.1

## 2.1.0

### Patch Changes

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

- 3845af0: Motion for production apps: exit and layout animations, animations started by actions and by screen focus, scroll behaviours, swipe actions, animated charts and lists, a set of animated components, and a canvas that stands still until asked.
  - `@mapples/style`: new motion keys that are not CSS and become props of the animated host: `exitAnimationName` (how an element leaves when it stops being rendered; presets in `EXIT_ANIMATION_PRESETS`: `fadeOut`, `fadeOutUp`, `fadeOutDown`, `slideOutLeft`, `slideOutRight`, `zoomOut`) with `exitAnimationDuration` / `exitAnimationDelay`, `layoutTransitionDuration` (the element slides to its new place when the layout around it changes), `animationReplay: 'focus'` (the animation plays again each time the screen is shown) and `motionName` (the name motion commands address the element by). `sendMotionCommand({ target, command, animation? })` plays, pauses or restarts a named element's animation, or plays a preset on it once. `ScreenMotionProvider`, `useScreenScroll`, `useScreenScrollHandler` and `useScreenFocusCount` let the elements of one screen react to its scroll views and to its focus. `MotionProvider` / `useMotionEnabled` turn the motion of everything inside on or off. `StyledFlatList` takes `animateChanges`.
  - `@mapples/navigation`: every route's page is wrapped in a `ScreenMotionProvider`.
  - `@mapples/ui`: a vertical `ScrollView` / `FlatList` reports to its screen while an element there reacts to scrolling; `FlatList` passes `animateChanges` on.
  - `@mapples/components`:
    - `TopAppBar` `scrollBehavior` (`elevate`, `collapse`, `hide`); `Fab` and `BottomActionBar` `hideOnScroll`.
    - `ListItem` `swipeActions` / `onSwipeAction`; `List` `animateChanges`.
    - `BarChart` and `LineChart` `animate`.
    - The `mapples:animation` action also reaches any element with a `motionName` (`play`, `pause`, and `play` with a one-off `animation` preset); `MotionActionHandler` forwards it.
    - New components: `AnimatedNumber`, `TypewriterText`, `ResultMark`, `ReactionButton`, `LiveIndicator`.
    - Loops and transitions of the library's own components stand still where a `MotionProvider` turned motion off.
  - `@mapples/app`: `MapplesRuntime` mounts `MotionActionHandler`.
  - `@mapples/codegen`: the five new component types import from `@mapples/components`.
  - `@mapplesorg/canvas`:
    - The frames stand still: motion plays only in Play, or with the new Animate switch in the zoom badge (off by default). Play in the Motion section still plays the selected element. The share link's storyboard has the same switch.
    - Buttons, inputs, checkboxes and switches take no press on the canvas or on the share storyboard; they work in Play.
    - The Motion section sets the exit animation, the layout transition, replay on focus and the name for actions; "Control animation" can play a preset once.
    - The palette's new Animated tab lists the animated components, Lottie and Rive, and motion presets (ordinary elements with motion already set).
  - `@mapplesorg/schematics`: the `animated-group` palette group, the new components' schematics, `MotionPresets`, the new props of the components above.
  - `@mapplesorg/ai-tools`: the motion hint covers exit, layout, replay and `motionName`; `add_connection`'s animation action takes a `motionName` target and a one-off `animation`.

- dd68ce2: No-code animations.
  - `@mapples/style`: a style can carry motion: CSS-style transitions (`transitionProperty`, `transitionDuration`, …) and keyframe animations (`animationName` with a preset from `ANIMATION_PRESETS` or keyframes written in place, `animationDuration`, `animationIterationCount`, …). `styled()` renders such an element through Reanimated's animated component and drops the motion keys when the OS asks for reduced motion. A style value may also be a selector value (`{ default, ':active' }`).
  - `@mapples/render`: interaction states. A `styled` key can name `$pressed`, `$hovered` or `$focused` after `::` (`style::$pressed`); `applyStateVariants` turns it into selector values, and `MapplesElement` applies it in generated apps.
  - `@mapples/types`, `@mapples/navigation`: `RouteNode.animation` sets the transition a stack screen opens with (`ROUTE_ANIMATIONS`); `validateNavigationDocument` reports `ANIMATION_NOT_STACK` and `ANIMATION_UNKNOWN`.
  - `@mapplesorg/canvas`, `@mapplesorg/schematics`: a Motion section in the Style tab, Pressed / Hovered / Focused in the State row, a Transition field for stack screens.
  - `@mapplesorg/ai-tools`: `set_element_style` and the subtree tools describe motion and take interaction states; new tool `set_route_animation`.

  **Breaking for apps on Reanimated 3:** `@mapples/style` now needs `react-native-reanimated` >= 4 as a peer dependency; `@mapples/dnd` moves its peers from Reanimated `~3.17.4` and gesture-handler `~2.24.0` to Reanimated >= 4 and gesture-handler >= 2.24; `@mapples/navigation` declares Reanimated >= 4. Apps created by the `mapples` CLI already have these.

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- e221581: The tab bar host compiles against every expo-router its peer range allows, and the @mapples packages pass mapples-open-kit's lint and format checks.
- 559db71: Sessions and data in a signed-in app: `mapples:clearResponses` forgets every `api.*` response on sign-out; `ApiDocument.session` declares the refresh request, so a 401 renews the session once and retries, and a refused refresh empties it; a request that runs again keeps its previous response while loading; a request chained after `mapples:setState` reads the written values; guards wait for persisted variables to load and an authored navigate wins over the guard of the screen being left; `mapples:if` chooses a follow-up by a condition, and array variables take `remove` and `toggleItem`; a bound `BarChart` draws empty until its request answers and tolerates null fields, and an element that fails to render is reported and left out instead of ending the app; the theme follows a variable (`MapplesApp themeVariable`) on every platform; re-importing a request keeps its state headers and data states, `--environment` adds a second environment with relative paths, and a bodiless response samples as `null`; `FlatList` data is optional and `createFetchTransport` takes the generated secrets as they are.

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- 98eae47: Expo SDK 58 support. expo-router 58 no longer vendors a navigation container that can stand apart from its root
  (`NavigationContainer` / `NavigationIndependentTree` are gone), so `MapplesNavigation` builds its tree with the host's
  React Navigation: the new required `backend` prop (`NavigationBackend` — container, navigators, actions and hooks of
  `@react-navigation/*`, optional peers that only `MapplesNavigation` hosts need). Screens and `TabBarHost` read their
  hooks through `NavigationHooksContext` (expo-router's copy by default, the backend's inside the tree). `TabBarHost`
  takes expo-router 58's tab bar props (`emitter`, `navigateToTab`) as well as React Navigation's; `NavigationActionHandler`
  takes `actions`; `navigationRef` is a React Navigation container ref (`MapplesNavigationRef` is removed). The container
  gets the theme of the surrounding `NavigationThemeProvider`. expo-router's internals are imported by their `…/index`
  entry, which its new `exports` map resolves, and the `expo-router` peer accepts 58.
- 35e9ba6: Creator behaviour runs in the exported app.
  - `@mapples/app`: `MapplesApp` mounts the behaviour runtime (`MapplesRuntime`) — action bus, project variables (`vars.*`) with the `mapples:setState` handler, the API runtime (`api.*`, real requests via `fetch` with secrets from `EXPO_PUBLIC_MAPPLES_SECRET_<NAME>`, or a custom `transport`) with the `mapples:request` handler, the focused route's params, and `RouterActionHandler`, which drives expo-router with the same `toNavigationCommand` semantics as Play (navigate pushes; guard redirects, `replace` and sign-in into a guarded area reset the history). It reads `mapples/navigation.ts`, `mapples/api.ts` and `mapples/variables.ts` through `mapplesResolver` (new `mapples::navigation|api|variables` modules). CLI-generated layouts wrap screens with `mapplesScreens(...)` (`MapplesScreen`: params, on-enter action, guard + fallback, page-scoped variables; `RouteGuard` for a route entering a nested navigator) and render tab/drawer icons with `RouteIcon`. New peers: `@mapples/action`, `@mapples/navigation`, `@mapples/request`, `@mapples/state`, `rxjs`; `expo-router` is no longer optional.
  - `@mapples/render`: `useElementBindings` / `useActionHandlers` — the one implementation of data bindings, `_visible`, asset refs and actions — shared by `RenderComponent` and the new `MapplesElement`, which `babel-plugin-mapples-sid` renders every element carrying `$data` / `$actions` / `$refs` through.
  - `@mapples/navigation`: exports `RouteScreen` / `RouteGuard`; a screen's blur no longer wipes the params the next focused screen already published (on-enter requests reading `route.*` could stall); Play's navigators take header visibility, titles and tab/drawer labels from the shared `routeHeaderVisible` / `routeTitle` / `routeItemLabel` (a route entering a nested navigator no longer draws a second header); `entersGuardFromFallback` also counts the guards on the nested initial route chain a navigate lands on, so signing in to a route whose nested area is guarded resets the history in Play and the exported app.
  - `@mapples/state`: `ActiveRouteState.releaseParams`.
  - `@mapples/types`: `routeHeaderVisible`, `routeTitle`, `routeItemLabel` — the header/title/label rules the canvas frame chrome and the generated layouts share (a route entering a nested navigator draws no header of its own).
  - `@mapples/style`: styled styles accept a `boxShadow` object `{ x, y, radius, color }` in their types, as the styler already rendered it.
  - `@mapples/sid-ast`: a newly added attribute (a binding's `$data`) goes right after the last attribute — no double space, and the space before `/>` stays.
  - `@mapplesorg/canvas`: frame chrome follows the shared header rule (no `Auth`/`Auth` double header); switching an action's type drops the previous type's `staticData` keys (no stale `pageUuid` on a set-variable action).

- b1b8560: Header options now apply to every navigator type, and their default is explicit. A tabs or drawer navigator draws a header of its own, but only a stack's options were mapped — so a navigator nested in a stack always stacked a second header under its parent's with nothing that could turn it off. `resolveNavigatorHeader` and `navigatorHeaderVisible` expose the navigator default (`visible` unset means shown), so an editor can present a plain on/off instead of a tri-state that reads "off" while the header is up; route-level `visible` stays tri-state, because unset there means "inherit the navigator". `NavigationDocument.canvas` carries editor-only canvas preferences, ignored by the runtime the same way `NavigatorNode.canvas` is.
- 7339399: Designed navigator chrome. A tabs navigator's `TabBarOptions.componentUuid` and a drawer's `DrawerOptions.componentUuid` name a saved component that renders the bar or the drawer content, and `TabBarOptions.native` asks the exported app for expo-router's `NativeTabs`. `@mapples/render` carries the contract (`NavigatorChromeContext`, `useNavigatorChrome`): the navigator's routes as items with a label, an active flag and an icon renderer, plus `select`, `close` and the safe-area insets. Two new `@mapples/components` elements read it — `TabBarItems` (one tab per route, pill, labels, badges' tones) and `DrawerItems` (one row per route) — and show a notice when the component is not a navigator's design yet; `@mapples/components` now peers on `@mapples/render`. `@mapples/navigation` mounts a design through `TabBarHost` / `DrawerContentHost` (React Navigation's `tabBar` / `drawerContent`, reading only their props so an exported app uses them as-is) when `MapplesNavigation` is given the `chrome` map, and keeps `visible: false` working for a custom bar. The Creator canvas draws a designed tab bar on every screen frame with its measured height as the bottom inset, a platform-styled placeholder for a native bar, frames a chrome master on the components surface at the chrome's shape with the navigator's routes flowing in, and labels storyboard sections with their design. `create_navigator_chrome` creates and assigns a starter design; `set_navigator_options` accepts the new fields.
- 35e9ba6: Guards on navigator routes, built-in glyph tab icons, and storyboard placement fixes (RC #16, #20, #21, #22, #33, #34).
  - `@mapples/types`: a guard on a route that enters a nested navigator protects the whole section; the validator rejects a fallback inside the guarded section (`navigatorRouteIds`). Tab / drawer icons accept a built-in glyph, `ref(glyph:<family>:<name>)` (`buildGlyphRef` / `parseGlyphRef`), besides an icon asset.
  - `@mapples/navigation`: navigator routes honour their guard (`RouteGuard`); guard redirects reset the history instead of pushing (`replace` on `mapples:navigate`), and navigating from a guard's fallback into the area it guards (sign in → signed-in area) resets it too, so no back arrow leads into or out of a protected area. `ref(glyph:…)` icons render through the host's registered `Icon` component.
  - `@mapples/components`: a `TabBarItems` / `BottomNavigationBar` item without an icon is a label-only tab (pill behind the label) instead of an empty pill.
  - `@mapplesorg/canvas`: frames and designed bars draw glyph tab icons; a stock bar's tab without an icon is label-only, not a grey square; the frame tab bar no longer asks the project typography for the editor's `caption` / `overline` variants; guarded sections get a "Guarded" chip and an amber arrow to their fallback; placing a section or screen from the palette commits the drawn cells of its container, so the new item lands where it was clicked instead of pushing unplaced neighbours around; zoom-to-fit includes sections; `IconNameGrid` is exported.
  - `@mapplesorg/ai-tools`: `set_route_guard` covers navigator routes; `set_route_options` takes glyph refs for `tabIcon` / `drawerIcon`.

- b1b8560: Routes carry a flow of their own: a `path` with `:token` params (`/product/:id`), an `onEnter` action emitted on every focus, and an access `guard` with a fallback route. Params travel on the navigate action as literals or value sources (`data` reads the pressed list row, `state` any binding), land in a new `route.*` state namespace the screen binds, and reach root-mounted handlers through `ActiveRouteProvider` — so a request bound to `route.id` loads the product page. `resolveValueSource` is shared by the request and navigation runtimes, and the new `data` source kind reads an action's resolved data. The navigate action form gets one source field per route param, the AI catalog `set_route_path` / `set_route_guard` / `set_route_on_enter` and `add_connection` params.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.

### Patch Changes

- 6769311: The `expo-router` peer range now admits Expo SDK 57 (`>=56.0.0 <58`).
- 6ae08e6: Tab and drawer screens no longer show their navigator-qualified name. With no explicit title React Navigation labels a screen with its registered name — which is `<navigator>:<route>` — so a tab read "Tabs:Blank" in the bar and in its header. Both navigators now default the title to the bare route name, the guard stacks already had.
- 224c7b9: Screens no longer remount when the navigator re-renders. Each screen's component is made once per navigator model and reads the build context (pages, fallback, document) at render, instead of being a new component on every render — which React Navigation treated as a new screen, so a theme change or a host re-render reset the focused screen's state and redrew what it loads after mount.
- 7523e9e: Tab and drawer icons take the navigator's `ColorValue`. `RouteIcon`'s `color` and `IconRenderer`'s `color` were typed `string`, so CLI-generated layouts that pass `tabBarIcon`'s `color` straight through (`<RouteIcon icon=… color={color} size={size} />`) failed with TS2322.

## 1.1.2

### Patch Changes

- 6150aa1: Update typography handling logic and resolve minor isssue
- Updated dependencies [6150aa1]
  - @mapples/action@1.1.2
  - @mapples/render@1.1.2
  - @mapples/style@1.1.2
  - @mapples/types@1.1.2

## 1.1.1

### Patch Changes

- f2313c2: feat: introudce navigation component
- Updated dependencies [f2313c2]
  - @mapples/action@1.1.1
  - @mapples/render@1.1.1
  - @mapples/style@1.1.1
  - @mapples/types@1.1.1
