# @mapples/codegen

## 2.1.0

### Patch Changes

- 0d82390: Lottie and Rive animations (#471).

  `@mapples/components` has two new elements. `LottieAnimation` plays a `.json` export or a `.lottie` file (`autoPlay`, `loop`, `speed`, `direction`, a `startFrame`–`endFrame` range, `resizeMode`, `colorOverrides` on iOS and Android) and reports `onLoad`, `onComplete`, `onLoop` (web) and `onError`. `RiveAnimation` plays a `.riv` file: an `artboard` and one `stateMachine`, with boolean and number `inputs` by name, `fit` and `alignment`, and Rive events through `onEvent`. It plays state machines only: the native Rive runtime has no linear-animation playback. Both have a bindable `playing` prop and do not start on their own while the OS "reduce motion" setting is on (`respectReduceMotion`).

  Both are controlled by a new `mapples:animation` action (`AnimationActionType.Control`, payload `AnimationActionData`) addressed to the element's `name`: `play`, `pause`, `stop`, `seek` (Lottie), `setInput` and `fireTrigger` (Rive). The elements subscribe to the action store themselves, so nothing is mounted in the app.

  The players are optional peers, loaded lazily: `lottie-react-native` and `@lottiefiles/dotlottie-react` (web) for Lottie; `@rive-app/react-native` with `react-native-nitro-modules`, and `@rive-app/canvas` (web), for Rive. `@mapples/action` is now a peer of `@mapples/components`. `@mapples/codegen` imports both elements from `@mapples/components`.

  Creator: project assets have two new kinds, `lottie` and `rive`. A file's kind is read from its name and content (`detectAnimationAsset`): `.riv` and `.lottie` are checked against their signature, and a `.json` is an animation only when it is a Lottie export, so a data file is never taken for one. The package catalog gains the optional `lottie` and `rive` runtimes, enabled by the element. Dropping an animation file on a frame creates its element, the assets panel lists animations with their first frame, and the action form has "Control animation".

  AI: `list_assets` and `add_asset_from_url` know the two kinds (the URL's content is checked), and `add_connection` accepts `action.kind: "animation"` with `animation: {target, command, progress?, input?, value?}`.

- b1a6e46: New `CameraView` element: the live camera picture with children laid over it (device camera through `expo-camera` on iOS and Android, the webcam on the web). `@mapples/style` adds `LiveMediaProvider` / `useLiveMedia`; the canvas turns live media off, so a camera is a black box there, and Play turns it on (a share storyboard keeps it off).
- d52fa87: - `collectImports` no longer throws on a `Custom` the file defines itself (`#StyledPressable`): it emits no import for it and lists it in the new `locals` field.
  - A member-tag `Custom` (`Animated.View`) is imported through its head binding (`import Animated from 'react-native-reanimated'`).
  - The instance linker leaves a component used with children unlinked, with a warning: linked, its children left the merged tree and sync deleted them from the file (or broke a ternary and aborted).
  - `unlink` writes an instance back under the name the file imports the component as, not the Creator's name, so sync no longer adds a second import and renames the tags.

  **Breaking:** `ResolvedImports` has a new required field `locals`, so code that builds one by hand for `printImports` must add it. Member-tag importRefs (`…#default.View`) written by this version are read wrongly by 2.0.x.

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

- d6dc247: Style variants under a data state work in generated code. A page element whose style changes while a Creator state holds (`'style::<state>'` under a state such as `vars.count::gt::3`) was printed without the condition, so an app built from the file never applied it.
  - `@mapples/sid-ast`: an element with such a variant declares the state in a new `$states` attribute, `$states={{ '<state>': { condition: 'vars.count::gt::3', name: 'High' } }}`, next to the unchanged `'style::<state>'` entry. Generated output changes only for elements that have these variants; prop states still print as code (`[styles.card, isActive && styles.cardActive]`) and `style::$pressed` needs no declaration. `extract` returns the declared states in `states` (never as a node prop), so `extract(emit(dom))` gives the same tree and the same states. New `syncElementStates(source, states)` sets every element's `$states` from a document's states (`patch` runs it when given `states`), new exports `elementStates` and `STATES_ATTR`.
  - `@mapples/codegen`: `adoptPropConditions` takes only the file's prop states from the file; a data state stays as the document has it.
  - `@mapples/render`: `MapplesElement` takes `$states` and applies a `key::state` variant while that state's condition holds on the app's data state.

- ffd671f: `@mapples/style` elements are read as their `@mapples/ui` types instead of placeholders (mapplesorg/mapples#97).

  `@mapples/sid-ast`: a `$sid` element imported from `@mapples/style` as `StyledView`, `StyledSafeAreaView`, `StyledScrollView`, `StyledPressable`, `StyledTextInput`, `StyledText` or `Typography` extracts as `View`, `SafeAreaView`, `ScrollView`, `Pressable`, `TextInput`, `Text` or `Typography`, with no `fallbackSize`. The file keeps the element as written: a Creator prop change is patched onto it in place. The text children of a `Typography` are its `text` prop on the canvas (the `@mapples/ui` `Typography` renders only `text`), and a Creator text change is written back as the children. `codemodAdopt` tags these elements as they are, with no swap and no `$fallback`. `ExtractResult.styleElements` lists the sids written this way. An element adopted earlier as a `Custom` placeholder is read under its new type on the next sync, and its leftover `$fallback` attribute is dropped.

  `@mapples/codegen`: `importNeedsFor(root, writtenAs)` skips the `@mapples/ui` import of the sids in `writtenAs`, so healing never adds an unused `View` import to a file that writes `<StyledView>`.

  Breaking (included in 2.1.0, owner 2026-11-16): `ExtractResult` gains the required `styleElements`, and extraction and adoption output change for `@mapples/style` elements (an element adopted earlier as a `Custom` placeholder changes type on the next sync).

- Updated dependencies [6976f74]
- Updated dependencies [d6dc247]
- Updated dependencies [4478367]
- Updated dependencies [647b81f]
- Updated dependencies [ffd671f]
  - @mapples/sid-ast@2.1.0

## 2.0.4

### Patch Changes

- @mapples/sid-ast@2.0.4

## 2.0.3

### Patch Changes

- @mapples/sid-ast@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [9cec45c]
  - @mapples/sid-ast@2.0.2

## 2.0.1

### Patch Changes

- fdd8822: A generated component file declares the props its document binds and passes them on (title={title}), instead of printing a $data binding the built app can't resolve.
- Updated dependencies [fdd8822]
- Updated dependencies [ec66663]
  - @mapples/sid-ast@2.0.1

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- e34d6a3: Library components are imported from `@mapples/components` instead of `@mapples/ui` (`moduleForType`, `COMPONENTS_MODULE`; `ResolvedImports.primitives` groups names by package). Generated components take `styled` and wrap their root in `<View styled={styled}>`, the way the canvas renders an instance.
- 7339399: Designed navigator chrome. A tabs navigator's `TabBarOptions.componentUuid` and a drawer's `DrawerOptions.componentUuid` name a saved component that renders the bar or the drawer content, and `TabBarOptions.native` asks the exported app for expo-router's `NativeTabs`. `@mapples/render` carries the contract (`NavigatorChromeContext`, `useNavigatorChrome`): the navigator's routes as items with a label, an active flag and an icon renderer, plus `select`, `close` and the safe-area insets. Two new `@mapples/components` elements read it — `TabBarItems` (one tab per route, pill, labels, badges' tones) and `DrawerItems` (one row per route) — and show a notice when the component is not a navigator's design yet; `@mapples/components` now peers on `@mapples/render`. `@mapples/navigation` mounts a design through `TabBarHost` / `DrawerContentHost` (React Navigation's `tabBar` / `drawerContent`, reading only their props so an exported app uses them as-is) when `MapplesNavigation` is given the `chrome` map, and keeps `visible: false` working for a custom bar. The Creator canvas draws a designed tab bar on every screen frame with its measured height as the bottom inset, a platform-styled placeholder for a native bar, frames a chrome master on the components surface at the chrome's shape with the navigator's routes flowing in, and labels storyboard sections with their design. `create_navigator_chrome` creates and assigns a starter design; `set_navigator_options` accepts the new fields.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- a6c5872: Published as Node ESM (`type: module`, `.js` import suffixes) from `mapples-kit`; the `mapples` CLI now consumes both from npm.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.

### Patch Changes

- d19ef84: Internal `dependencies` (not peers) between `@mapples/*` and `@mapplesorg/*` packages are pinned to the exact version of the same release train, so a fresh `npm install` of a beta can no longer resolve a sibling to the `rc` build (which sorts above every beta of the same version) — `@mapples/codegen` beta no longer pulls an `@mapples/sid-ast` rc missing `isPropBinding`.
- 85e2bb6: Generated code imports `ActivityRings`, `BarChart`, `CalendarHeatmap`, `DayPicker` and `LineChart` from `@mapples/components`.
- c344732: Generated code imports `Calendar`, `ChoiceGrid`, `CountdownTimer`, `DateTile`, `MapView`, `MasonryGrid`, `MiniPlayer`, `NumericKeypad`, `PlaybackControls`, `RangeSlider`, `ReorderableList`, `TicketCard`, `TimePicker`, `WaveformSeekBar` and `BreathingGuide` from `@mapples/components`.
- 0e97063: A component file that passes a declared prop straight on to a primitive — `title={title}`, `title={props.title}`, or `<Text>{label}</Text>` as the only content — now extracts it as a `props.<name>` data binding (`dataProps.title = { key: 'props.title', active: true }`) instead of a `NON_LITERAL_PROP` warning, so the canvas renders an instance with the values it was given. The file keeps the code: `patch` never writes those bindings into `$data`, keeps the bound text, and warns when the document asks for a different binding or text there (`ElementInfo.propBindings`, `AttrInfo.propBinding`). `isPropBinding(key)` is exported. `@mapples/codegen`: `adoptPropConditions` also takes a file's pass-through bindings over the document's, like its prop guards and style variants.
- Updated dependencies [35e9ba6]
- Updated dependencies [cffb0d6]
- Updated dependencies [a6c5872]
- Updated dependencies [a6c5872]
- Updated dependencies [bc0d0c4]
- Updated dependencies [396a4a9]
- Updated dependencies [0e97063]
- Updated dependencies [7a49679]
- Updated dependencies [ddda791]
  - @mapples/sid-ast@2.0.0
