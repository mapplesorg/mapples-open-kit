# @mapples/ui

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

- 09dfc8e: `Svg` renders its markup with react-native-svg's `SvgXml` instead of a `data:` URI through `SvgUri`, which fell back to `fetch` and failed on Android ("unknown protocol: data").

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- ec66663: An instance that leaves a prop out renders the default its file declares: props passed on to a nested component are bindings, an unset binding keeps the master's default, and Typography renders nothing for an unset text instead of 'Not a string'.
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
- bf46cad: `IconButton` takes `styled.styleBadge` and `styled.styleBadgeLabel` for its count badge (position, size, fill, text), like the tab bar's badge; Creator lists them as Badge / Badge text.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- 2064e9e: `Container`, `HorizontalScrollView`, `GridTwoColumns`, `GridThreeColumns` and `GridFourColumns` are now real components, so the imports generated code writes for those canvas types render instead of throwing "Element type is invalid". `HorizontalScrollView` scrolls horizontally by default and each grid carries its column count. The `HorizontalScrollView` schematic export is renamed `HorizontalScrollViewSchematic`, in line with the other schematics.

  `Typography` now types `variant` and `color`, and `ScrollView` takes React Native's `ScrollViewProps`, so `styled.contentContainerStyle` type-checks.

- 896c912: Components follow the project's sizing and keep brand text readable. `useShape()` derives corner radii and control heights from `sizing.radius`, `sizing.radiusLarge` and `sizing.control` (what the design setup writes); a project without them renders exactly as before, and `radius: 0` squares off pills too. Each tone gains `ink` — its `main` colour when that reads at 4.5:1 on the card surface, else the better of its `dark`/`light` shades — and text, outlines, labels and glyphs use it, so a fill-only brand colour such as a lime no longer prints unreadable text.
- b05ab36: `IconButton` gains `size: 'xl'` (76 pt, the round play/pause control) and `shape: 'auto' | 'circle' | 'rounded'`; buttons and fields stay on `sm`–`lg`. Two optional sizing keys join `radius` / `radiusLarge` / `control`: `sizing.borderWidth` (0–4) sets the outline weight of surfaces and controls through `useShape().borderWidth(default)` and `emphasisWidth(default)` (focus and current-item rings stay one point heavier), and `sizing.shadowOffset` (0–8) turns the soft elevation into a hard offset shadow in the text colour, read with the new `useElevation()` hook (`resolveElevation` and `ELEVATION_UP` are exported too). A project without the keys renders exactly as before. The `Project Shape` section of the README lists all five keys.

### Patch Changes

- b869b58: The errors thrown when an optional package is missing at runtime (QRCode's `react-native-qrcode-svg`, an icon family's `@react-native-vector-icons/*` pack, MapView's `react-native-maps`) now name both ways to fix it: enable the package in the Creator's Project settings → Packages for a Creator-first app, or run `mapples sync` and then the install command it names for a code-first app, where the sync has already put the dependency in package.json. They used to point only at the Creator.
- 1c5088b: `Pressable` no longer defaults `onPress` to `console.log`: a Pressable without its own handler printed the raw press event on every tap.
- 80dbbef: `@mapples/style` exports `StyledFlatListProps` from its root; `@mapples/ui`'s `FlatList` imports it from there instead of a `src/` deep path that published builds do not ship.
- e9289e6: `Icon` warns once in development when `iconName` is not a glyph of the icon family it draws from. The family's font draws such a name as "?" without any message; the warning names the family and the glyph.
- 4c918f8: ImageBackgroundView's content view (`styled.styleContent`) fills the container (`flexGrow: 1`), so a `flex: 1` scrim child covers the whole photo and `justifyContent` on the content reaches its bottom edge. Before, the content view was only as tall as its children and the scrim covered the top of the photo.
- c33f8a3: `Image` fills its `styled.style` box by default (`styleImage` still overrides the picture's size) and clips to a rounded container's corners, so `styled={{ style: { width: '100%', height: 150 } }}` no longer renders a 0px-tall picture on web.
- 546561e: `TextInput` is typed with `WithStyledProps`, so `styled` (including `placeholderTextColor: 'theme.…'`) type-checks.

## 1.5.0

### Minor Changes

- 264ed6e: `ButtonGroupContext` (`direction`, `equal`, `fill`) is exported next to `Button`, and `Button` sizes itself from it: an equal share of a row (a zero basis when the group spans its parent, the labels' width otherwise) and the full width of a column. It applies to the bare and themed renders alike; author styles still override it.

## 1.4.0

### Minor Changes

- 92b5e73: The themed component library. `@mapples/components` gains 48 components across six groups — actions, inputs, content, navigation, feedback and overlays — that paint themselves from the project theme and ship a canvas schematic each; `ImageCarousel` moves under `content/` alongside them, and `expo-image`, `react-native-gesture-handler` and `lodash` join the package's dependency surface.

  `@mapples/ui` adds the design tokens (control sizes, radii, elevation, state-layer opacities) and the `useTones` hook the library paints from, deriving neutrals from the text colour at an alpha so they invert with the theme; `Button`, `IconButton`, `SubmitButton` and `TextInput` gain themed `variant`s (`filled`, `tonal`, `outlined`, `text`, `elevated`) behind an optional prop — left unset they render exactly as before.

  `@mapples/style` adds `withAlpha`, which rewrites a resolved colour at a given alpha and throws on an unresolved token. `@mapples/app` mounts a `GestureHandlerRootView` above the rendered tree, which the gesture-driven components (`Slider`, `BottomSheet`) need, and takes `react-native-gesture-handler` as a peer dependency.

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

- 6f3edc2: Icon/Vector split: `@mapples/ui`'s `Icon` now renders font glyphs from the `@react-native-vector-icons` families (declared as peer dependencies), resolving its default family from the project style config; the old uri-based SVG icon lives on as the new `Vector` component. `@mapples/style` adds a project-wide `icons` config to the theme, and `@mapples/render` remaps legacy uri `Icon` nodes to `Vector` on document load.

## 1.1.3

### Patch Changes

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

- b39e19e: chore: clean code
- b39e19e: feat: rename ui lib components var

## 1.0.7

### Patch Changes

- a1151e5: feat: add svg handler component

## 1.0.6

### Patch Changes

- 53fb55e: feat: add select component

## 1.0.5

### Patch Changes

- 5b1fc18: Add form components

## 1.0.4

### Patch Changes

- 20aca8c: Resolve issues with z Index

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
