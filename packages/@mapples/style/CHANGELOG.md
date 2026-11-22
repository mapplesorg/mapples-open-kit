# @mapples/style

## 2.1.0

### Patch Changes

- b1a6e46: New `CameraView` element: the live camera picture with children laid over it (device camera through `expo-camera` on iOS and Android, the webcam on the web). `@mapples/style` adds `LiveMediaProvider` / `useLiveMedia`; the canvas turns live media off, so a camera is a black box there, and Play turns it on (a share storyboard keeps it off).
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

- 559db71: Sessions and data in a signed-in app: `mapples:clearResponses` forgets every `api.*` response on sign-out; `ApiDocument.session` declares the refresh request, so a 401 renews the session once and retries, and a refused refresh empties it; a request that runs again keeps its previous response while loading; a request chained after `mapples:setState` reads the written values; guards wait for persisted variables to load and an authored navigate wins over the guard of the screen being left; `mapples:if` chooses a follow-up by a condition, and array variables take `remove` and `toggleItem`; a bound `BarChart` draws empty until its request answers and tolerates null fields, and an element that fails to render is reported and left out instead of ending the app; the theme follows a variable (`MapplesApp themeVariable`) on every platform; re-importing a request keeps its state headers and data states, `--environment` adds a second environment with relative paths, and a bodiless response samples as `null`; `FlatList` data is optional and `createFetchTransport` takes the generated secrets as they are.

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- 87961e8: React Native 0.88 types (Expo SDK 58). React Native now types `View`, `TextInput` and `ScrollView` as function
  components, so component refs are `ComponentRef<typeof View>` (and the same for `TextInput` / `ScrollView`) instead of
  `forwardRef<View>`. `StyledProps` drops the `undefined` an inferred style now carries; `Styler.flatten` and the new
  `flattenStyleProp` accept sizing tokens again; dnd keeps its measured layouts as mutable copies of the now read-only
  `LayoutRectangle`. `@mapples/style` adds `useNavigationTheme` and gives navigation themes string colors, which both
  expo-router and React Navigation accept.
- 35e9ba6: Creator behaviour runs in the exported app.
  - `@mapples/app`: `MapplesApp` mounts the behaviour runtime (`MapplesRuntime`) — action bus, project variables (`vars.*`) with the `mapples:setState` handler, the API runtime (`api.*`, real requests via `fetch` with secrets from `EXPO_PUBLIC_MAPPLES_SECRET_<NAME>`, or a custom `transport`) with the `mapples:request` handler, the focused route's params, and `RouterActionHandler`, which drives expo-router with the same `toNavigationCommand` semantics as Play (navigate pushes; guard redirects, `replace` and sign-in into a guarded area reset the history). It reads `mapples/navigation.ts`, `mapples/api.ts` and `mapples/variables.ts` through `mapplesResolver` (new `mapples::navigation|api|variables` modules). CLI-generated layouts wrap screens with `mapplesScreens(...)` (`MapplesScreen`: params, on-enter action, guard + fallback, page-scoped variables; `RouteGuard` for a route entering a nested navigator) and render tab/drawer icons with `RouteIcon`. New peers: `@mapples/action`, `@mapples/navigation`, `@mapples/request`, `@mapples/state`, `rxjs`; `expo-router` is no longer optional.
  - `@mapples/render`: `useElementBindings` / `useActionHandlers` — the one implementation of data bindings, `_visible`, asset refs and actions — shared by `RenderComponent` and the new `MapplesElement`, which `babel-plugin-mapples-sid` renders every element carrying `$data` / `$actions` / `$refs` through.
  - `@mapples/navigation`: exports `RouteScreen` / `RouteGuard`; a screen's blur no longer wipes the params the next focused screen already published (on-enter requests reading `route.*` could stall); Play's navigators take header visibility, titles and tab/drawer labels from the shared `routeHeaderVisible` / `routeTitle` / `routeItemLabel` (a route entering a nested navigator no longer draws a second header); `entersGuardFromFallback` also counts the guards on the nested initial route chain a navigate lands on, so signing in to a route whose nested area is guarded resets the history in Play and the exported app.
  - `@mapples/state`: `ActiveRouteState.releaseParams`.
  - `@mapples/types`: `routeHeaderVisible`, `routeTitle`, `routeItemLabel` — the header/title/label rules the canvas frame chrome and the generated layouts share (a route entering a nested navigator draws no header of its own).
  - `@mapples/style`: styled styles accept a `boxShadow` object `{ x, y, radius, color }` in their types, as the styler already rendered it.
  - `@mapples/sid-ast`: a newly added attribute (a binding's `$data`) goes right after the last attribute — no double space, and the space before `/>` stays.
  - `@mapplesorg/canvas`: frame chrome follows the shared header rule (no `Auth`/`Auth` double header); switching an action's type drops the previous type's `staticData` keys (no stale `pageUuid` on a set-variable action).

- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 8677f0c: `contrastRatio(a, b)` returns the WCAG contrast ratio of two resolved colours (1–21) and throws on anything that is not a colour, like `withAlpha`.

### Patch Changes

- 0574e16: `isColorString` accepts the `rgb()` / `rgba()` spacing React Native accepts: `rgba(16,20,12,0.05)`, `rgba( 16 , 20 , 12 , .05 )` and `rgb(16 20 12 / 0.05)` are colors. It used to require exactly one space after each comma, so an unspaced value was treated as a theme token path, failed to resolve and fell back to the theme's opaque `defaultColor` — a 5% box-shadow rendered solid black.
- 80dbbef: `@mapples/style` exports `StyledFlatListProps` from its root; `@mapples/ui`'s `FlatList` imports it from there instead of a `src/` deep path that published builds do not ship.
- affab3f: Fractional sizing multipliers resolve: `'*0.5'` and `'*1.5'` (and `*n` inside `calc(...)`) become `base × n` instead of
  reaching React Native as the literal string, and `getSize` no longer truncates them to whole steps.

## 1.4.0

### Minor Changes

- 92b5e73: The themed component library. `@mapples/components` gains 48 components across six groups — actions, inputs, content, navigation, feedback and overlays — that paint themselves from the project theme and ship a canvas schematic each; `ImageCarousel` moves under `content/` alongside them, and `expo-image`, `react-native-gesture-handler` and `lodash` join the package's dependency surface.

  `@mapples/ui` adds the design tokens (control sizes, radii, elevation, state-layer opacities) and the `useTones` hook the library paints from, deriving neutrals from the text colour at an alpha so they invert with the theme; `Button`, `IconButton`, `SubmitButton` and `TextInput` gain themed `variant`s (`filled`, `tonal`, `outlined`, `text`, `elevated`) behind an optional prop — left unset they render exactly as before.

  `@mapples/style` adds `withAlpha`, which rewrites a resolved colour at a given alpha and throws on an unresolved token. `@mapples/app` mounts a `GestureHandlerRootView` above the rendered tree, which the gesture-driven components (`Slider`, `BottomSheet`) need, and takes `react-native-gesture-handler` as a peer dependency.

## 1.3.0

### Minor Changes

- 6f3edc2: Icon/Vector split: `@mapples/ui`'s `Icon` now renders font glyphs from the `@react-native-vector-icons` families (declared as peer dependencies), resolving its default family from the project style config; the old uri-based SVG icon lives on as the new `Vector` component. `@mapples/style` adds a project-wide `icons` config to the theme, and `@mapples/render` remaps legacy uri `Icon` nodes to `Vector` on document load.

### Patch Changes

- 6f3edc2: `Typography` applies element styles after the variant font keys, so an element's own `fontFamily`, `fontSize` and `fontWeight` override the typography variant instead of being clobbered by it.

## 1.2.0

### Minor Changes

- 40751c7: `SvgStyle`: a dedicated style type for SVG-rendering components (view geometry plus `color`), replacing the `TextStyle` stand-in that breaks under `react-native-web`'s widened `cursor` typing; `zIndex` rejects malformed values instead of dropping them. `@mapples/ui` types icon SVG styles as `SvgStyle` and lets an unencodable barcode surface an error instead of rendering blank.

## 1.1.2

### Patch Changes

- 6150aa1: Update typography handling logic and resolve minor isssue

## 1.1.1

### Patch Changes

- f2313c2: feat: introudce navigation component

## 1.1.0

### Minor Changes

- 77277bc: Update to rn 56

## 1.0.8

### Patch Changes

- b39e19e: feat: integrate expo image package

## 1.0.7

### Patch Changes

- a1151e5: fix: resolve typography style order implementation

## 1.0.6

### Patch Changes

- 53fb55e: feat: introduce inlang feature\
- 53fb55e: feat: propagate canvas dims to style

## 1.0.5

### Patch Changes

- 0056c27: Resolve nested props style parser issues

## 1.0.4

### Patch Changes

- 20aca8c: Resolve issues with z Index
- 20aca8c: Replace rn shadow with modern box shadow property
- 20aca8c: Fix issues with rerendering and perfomance improvements

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
