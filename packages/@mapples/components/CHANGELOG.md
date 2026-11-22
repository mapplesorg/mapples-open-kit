# @mapples/components

## 2.1.0

### Patch Changes

- 0d82390: Lottie and Rive animations (#471).

  `@mapples/components` has two new elements. `LottieAnimation` plays a `.json` export or a `.lottie` file (`autoPlay`, `loop`, `speed`, `direction`, a `startFrame`–`endFrame` range, `resizeMode`, `colorOverrides` on iOS and Android) and reports `onLoad`, `onComplete`, `onLoop` (web) and `onError`. `RiveAnimation` plays a `.riv` file: an `artboard` and one `stateMachine`, with boolean and number `inputs` by name, `fit` and `alignment`, and Rive events through `onEvent`. It plays state machines only: the native Rive runtime has no linear-animation playback. Both have a bindable `playing` prop and do not start on their own while the OS "reduce motion" setting is on (`respectReduceMotion`).

  Both are controlled by a new `mapples:animation` action (`AnimationActionType.Control`, payload `AnimationActionData`) addressed to the element's `name`: `play`, `pause`, `stop`, `seek` (Lottie), `setInput` and `fireTrigger` (Rive). The elements subscribe to the action store themselves, so nothing is mounted in the app.

  The players are optional peers, loaded lazily: `lottie-react-native` and `@lottiefiles/dotlottie-react` (web) for Lottie; `@rive-app/react-native` with `react-native-nitro-modules`, and `@rive-app/canvas` (web), for Rive. `@mapples/action` is now a peer of `@mapples/components`. `@mapples/codegen` imports both elements from `@mapples/components`.

  Creator: project assets have two new kinds, `lottie` and `rive`. A file's kind is read from its name and content (`detectAnimationAsset`): `.riv` and `.lottie` are checked against their signature, and a `.json` is an animation only when it is a Lottie export, so a data file is never taken for one. The package catalog gains the optional `lottie` and `rive` runtimes, enabled by the element. Dropping an animation file on a frame creates its element, the assets panel lists animations with their first frame, and the action form has "Control animation".

  AI: `list_assets` and `add_asset_from_url` know the two kinds (the URL's content is checked), and `add_connection` accepts `action.kind: "animation"` with `animation: {target, command, progress?, input?, value?}`.

- 5fdf9ed: Languages and translations for apps built with Mapples (#469).

  `@mapples/types`: the locales document (`LocalesDocument`: a default locale, the supported ones and a message table per locale), `validateLocalesDocument`, `matchLocale`, `isRtlLocale`, and the message format: an ICU subset (`{path}` placeholders, `plural`, `selectordinal`, `select`, `number`, `date`, `time`) with `parseMessage`, `formatMessage`, `formatValue` and `parseValueFormat`. `DataProp` gains an optional `format` (`number`, `number, currency/USD`, `date, long`) that writes the bound value for the active locale. A project without the document is single-language and behaves as before.

  `@mapples/state`: `LocaleProvider` (device locale, closest supported, default; `inherit` starts a session over the surrounding project), `LocaleActionHandler` for the new `mapples:setLocale` action, `LocaleDirection`, `useLocaleState` and `deviceLocales`. Bindings resolve `t.<key>` to the translated message (placeholders are binding paths) and `locale.current | language | direction | isRTL | default | supported` to the active locale.

  `@mapples/app`: `MapplesApp` and `MapplesRuntime` mount the locale runtime from `project.locales` (the CLI's `locales.ts`, resolved as `mapples::locales`), keep the user's choice in `variablesStorage`, take a `locale` prop that pins it, and lay the app out right-to-left for an RTL locale (`direction` style on native, `dir` on web; Android also records it in `I18nManager` for the next launch).

  `@mapples/render` exports `useIsRTL()`; `TopAppBar`, `Breadcrumbs`, `ProgressBar` and `Rating` in `@mapples/components` mirror by it, so they follow a locale switched at runtime.

  `@mapplesorg/canvas`: frames and Play render in the host's `LocaleProvider` locale and direction, the action editor offers "Set language", and `MessageExtractProvider` lets a host turn a literal text into a message key from the inspector. `@mapplesorg/schematics`: the `placeholder` of TextInput and TextField is bindable.

  `@mapplesorg/ai-tools`: `get_translations`, `add_locale`, `remove_locale`, `set_default_locale`, `set_translations`, `remove_translation` and `translate_project`; `add_connection` takes `action.kind: "setLocale"`; `ProjectContext.locales` lists a multilingual project's languages.

  Creator: a Translations panel (languages, texts per language, missing markers, JSON / CSV import and export, a locale preview for the canvas and Play), translation keys in the binding picker, and the same data in the share viewer and the Preview app.

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

## 2.0.4

## 2.0.3

## 2.0.2

## 2.0.1

### Patch Changes

- 6709764: BottomActionBar and BottomNavigationBar clear the device's real bottom inset, so an Android navigation bar no longer covers them. Adds react-native-safe-area-context as a peer dependency, which @mapples/style already requires.
- 4faa4d9: DayPicker shrinks a label longer than a weekday to fit its cell on native.
- e221581: The tab bar host compiles against every expo-router its peer range allows, and the @mapples packages pass mapples-open-kit's lint and format checks.
- 559db71: Sessions and data in a signed-in app: `mapples:clearResponses` forgets every `api.*` response on sign-out; `ApiDocument.session` declares the refresh request, so a 401 renews the session once and retries, and a refused refresh empties it; a request that runs again keeps its previous response while loading; a request chained after `mapples:setState` reads the written values; guards wait for persisted variables to load and an authored navigate wins over the guard of the screen being left; `mapples:if` chooses a follow-up by a condition, and array variables take `remove` and `toggleItem`; a bound `BarChart` draws empty until its request answers and tolerates null fields, and an element that fails to render is reported and left out instead of ending the app; the theme follows a variable (`MapplesApp themeVariable`) on every platform; re-importing a request keeps its state headers and data states, `--environment` adds a second environment with relative paths, and a bodiless response samples as `null`; `FlatList` data is optional and `createFetchTransport` takes the generated secrets as they are.

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- 66f026f: Five new components. `BarChart` draws category bars with highlighted bars, value and axis labels and guide lines; `LineChart` draws a straight or smooth line with an optional fading area, guide lines, an end marker and a dashed marker at one point; `CalendarHeatmap` shows activity levels as a weeks grid or a month calendar with a legend; `ActivityRings` draws up to five concentric progress rings; `DayPicker` is a single- or multi-select row of days (date strip or weekday toggles) with markers, today and disabled days. Dates are `YYYY-MM-DD` strings, and malformed data throws.
- 3b58612: `ListItem` covers more row kinds. `leading: 'checkbox'` puts the control at the start (with `strikeWhenChecked` for done rows) and `leading: 'text'` shows a rank column from `leadingText`; `leadingShape` sets the avatar and photo corners. `trailing` gains `radio`, `link` (a pressable `trailingText` calling `onTrailingPress`) and `badge` (tinted by `trailingTone`), `trailingChevron` adds a chevron after any trailing kind, and `switchSize` sizes the trailing switch. New slots: `styleDescription`, `styleTrailingIcon`, `styleLeadingText`, `styleTitleChecked`, `styleRadio`, `styleBadge`, `styleBadgeLabel`. An unknown `leading` or `trailing` value now throws instead of drawing a checkbox.
- ae9ac68: `MediaCard` gains a `plain` variant (no surface, text straight under the photo), an `overline`, an overlay action on the photo (`actionIconName`, `actionSelectedIconName`, `actionSelected`, `actionLabel`, `onActionPress`) that does not press the card, a title accessory such as a rating (`titleAccessory`, `titleAccessoryIconName`), `price` with a struck-through `originalPrice`, `imagePosition: 'end'` for horizontal cards, `titleLines` and a `styleTagLabel` slot. An action without `actionLabel`, an `originalPrice` without `price` and a negative or fractional `titleLines` throw.
- 1826e4e: `BottomNavigationBar` and `TabBarItems` choose the active mark with `indicator`: `pill` (as before), `bar` on the item's top edge, `dot` under the label, or `none`. Bottom navigation items may be label-only (an item needs a label or an icon; a label-only item shows its badge beside the label), and the bar takes `iconSize`, `dividers` and the `styleBadgeLabel` / `styleDivider` slots.
- c508f2f: Fifteen new components for the app templates: `DateTile`, `Calendar` (single date or range), `TimePicker`, `CountdownTimer`, `RangeSlider` (two thumbs, optional histogram), `PlaybackControls`, `WaveformSeekBar` and `MiniPlayer` (controlled player UI — the app owns playback), `TicketCard` (perforated ticket with a stub), `NumericKeypad`, `ChoiceGrid` (icon, swatch, size and tile pickers), `BreathingGuide`, `ReorderableList` (drag handle plus Move up / Move down actions), `MasonryGrid`, and `MapView` with price and glyph pins. `MapView` uses `react-native-maps` on iOS and Android — a new optional peer dependency (`>=1.20.0`): an app that renders a MapView installs it (`npx expo install react-native-maps`), adds its config plugin and, on Android, a Google Maps API key; without it a native MapView throws a clear error. On web MapView draws a static map. Malformed data throws a `<Component>: …` error in every new component.
- 7789dd4: More of the app-template designs can be built with the existing components, and they follow the new `borderWidth` / `shadowOffset` sizing keys (outlines, focus rings and elevation). New options:
  - `TopAppBar`: `overline`, `titleIconName`, text actions (`label` without an icon), per-action `badgeCount` / `selected` / `selectedIconName` / `disabled`, a trailing avatar (`avatarName`, `avatarSource`, `onAvatarPress`).
  - `SectionHeader`: `overline` and a plain `trailingText`. `StatTile`: `variant: 'plain'`, `iconPlacement`, `trendPlacement: 'inline'`, `trendIcon: 'arrow'`.
  - `Chip` / `ChipGroup`: `showSelectedIcon`, `selectedAppearance: 'filled'`, `presentation: 'tile'`, `strikeDisabled`, `layout: 'grid'` with `columns`. `SegmentedControl`: `variant: 'outlined'`, `strikeDisabled`. `Badge`: `iconName` and `appearance: 'soft' | 'outline'`.
  - `InputField`: `underlined` and `plain` variants, `description`, `prefix` / `suffix`, a trailing text action. `RadioGroup`: option `meta`, `variant: 'card'`, `dividers`, `styleItemSelected`. `Checkbox`: `size: 'xl'` and `meta`. `NumberStepper`: `layout: 'split'`. `Switch`: `shape: 'rounded'`, `thumbShadow`, `styleThumbOn`. `PinInput`: `variant: 'dots'` and `showKeyboard={false}` for an on-screen keypad.
  - `Steps`: `variant: 'segments'`, `showLabels`. `ProgressBar`: `segments`, `markerValue`, `size: 'xs'`. `Timeline`: `tone`, `doneTone`, `timePlacement: 'leading'`, `statusLabel`, `kind: 'leg'` transit legs. `Divider`: `lineStyle: 'dashed' | 'dotted'`.
  - `BottomSheet`: `modal={false}` with `snapPoints`, `defaultSnapIndex`, `onSnapChange`; a header close button; `footerActions` / `footerText`. `ImageCarousel`: `onIndexChange`, `indicatorVariant: 'bars' | 'counter'`, `indicatorPosition`, children as an overlay. `Tabs`: two-line items (`overline`), `indicatorThickness`, `indicatorInset`. `BottomNavigationBar` / `TabBarItems`: `indicator: 'expand'` (the floating bar's active item opens into a labelled pill).
    Behaviour changes: a vertical `Divider` now stretches to its row (it had no height before); `ImageCarousel` no longer prints "Title" / "Subtitle" on photo-only slides; a `RadioGroup` `styleDot` size and radius now win; new validations throw on malformed input (e.g. a TopAppBar action with neither `iconName` nor `label`, `trailingText` together with `actionLabel`, bad `snapPoints`).
- 87961e8: React Native 0.88 types (Expo SDK 58). React Native now types `View`, `TextInput` and `ScrollView` as function
  components, so component refs are `ComponentRef<typeof View>` (and the same for `TextInput` / `ScrollView`) instead of
  `forwardRef<View>`. `StyledProps` drops the `undefined` an inferred style now carries; `Styler.flatten` and the new
  `flattenStyleProp` accept sizing tokens again; dnd keeps its measured layouts as mutable copies of the now read-only
  `LayoutRectangle`. `@mapples/style` adds `useNavigationTheme` and gives navigation themes string colors, which both
  expo-router and React Navigation accept.
- 7339399: Designed navigator chrome. A tabs navigator's `TabBarOptions.componentUuid` and a drawer's `DrawerOptions.componentUuid` name a saved component that renders the bar or the drawer content, and `TabBarOptions.native` asks the exported app for expo-router's `NativeTabs`. `@mapples/render` carries the contract (`NavigatorChromeContext`, `useNavigatorChrome`): the navigator's routes as items with a label, an active flag and an icon renderer, plus `select`, `close` and the safe-area insets. Two new `@mapples/components` elements read it — `TabBarItems` (one tab per route, pill, labels, badges' tones) and `DrawerItems` (one row per route) — and show a notice when the component is not a navigator's design yet; `@mapples/components` now peers on `@mapples/render`. `@mapples/navigation` mounts a design through `TabBarHost` / `DrawerContentHost` (React Navigation's `tabBar` / `drawerContent`, reading only their props so an exported app uses them as-is) when `MapplesNavigation` is given the `chrome` map, and keeps `visible: false` working for a custom bar. The Creator canvas draws a designed tab bar on every screen frame with its measured height as the bottom inset, a platform-styled placeholder for a native bar, frames a chrome master on the components surface at the chrome's shape with the navigator's routes flowing in, and labels storyboard sections with their design. `create_navigator_chrome` creates and assigns a starter design; `set_navigator_options` accepts the new fields.
- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- bf46cad: `TabBarItems` can show a count per tab: `badgeCounts` keyed by the tab's label (`{ Bag: 2 }`; 0 or a non-number hides it — Creator's Counts field holds numeric text), styled through the new `styleBadge` / `styleBadgeLabel` slots.
- 9a80415: Custom and predesigned tab bars. Three new `@mapples/components` elements build a tab bar from ordinary elements: `TabTemplate` repeats its children once per tab of the navigator whose design it sits in (each copy pressable, switching to its tab), and `TabIcon` / `TabLabel` draw that tab's icon and label, with a `styleActive` slot for the active tab. `@mapples/render` scopes each copy through `NavigatorChromeItemProvider` (`useNavigatorChromeItem`), and `@mapples/state` resolves a new reserved binding root, `tab.*` (`tab.label`, `tab.active`, `tab.index`, `TAB_NAMESPACE` in `@mapples/types`), so any element inside the template can bind the tab or show only on the active one — a project whose data state has a top-level `tab` field is now shadowed inside a template. `TabBarOptions.floating` lays a designed bar over the screens instead of below them; `TabBarHost` takes the matching `floating` prop (an exported app passes it next to `Chrome`), pins the bar to the bottom edge, pads it for the home indicator and keeps reporting its height. `@mapplesorg/schematics` holds the starter designs as a registry (`CHROME_PRESETS`: Basic, Floating, Pill, Minimal and Custom tab bars, the basic drawer), replacing the canvas's two init documents. The Creator canvas edits the template in the first tab and mirrors it read-only in the others, evaluates `tab.*` conditions while designing, previews a design nobody has assigned yet against sample tabs, draws a floating bar over its screen frames, resolves a master's data bindings wherever it is rendered read-only (instances, frame chrome, Play), and gives a tab bar design its own "Tab bar" rail palette. `create_navigator_chrome` takes a `preset`; `set_navigator_options` accepts `tabBar.floating`.
- 896c912: Components follow the project's sizing and keep brand text readable. `useShape()` derives corner radii and control heights from `sizing.radius`, `sizing.radiusLarge` and `sizing.control` (what the design setup writes); a project without them renders exactly as before, and `radius: 0` squares off pills too. Each tone gains `ink` — its `main` colour when that reads at 4.5:1 on the card surface, else the better of its `dark`/`light` shades — and text, outlines, labels and glyphs use it, so a fill-only brand colour such as a lime no longer prints unreadable text.

### Patch Changes

- c4ca60b: `Checkbox` exposes its state through `aria-checked` / `aria-disabled` (react-native-web 0.21 ignores `accessibilityState`, so the `role="checkbox"` element had no checked state on web), and an `accessibilityLabel` passed to the Checkbox now names the box instead of the row around it.
- 5fde32c: A pressable `Card` or `TicketCard`, a `ListItem` row that holds its own control (a trailing action or link, a switch, a checkbox) and a removable `Chip` no longer render as a `<button>` on the web, where react-native-web turns `role="button"` into one and the buttons inside nested in it (React: "`<button>` cannot contain a nested `<button>`"). There they are a focusable element instead: click and Enter still press them, their label is kept, and the buttons inside stay separately focusable. Native keeps the button role. A row or chip without an inner control is still a button everywhere.
- 2f31f52: MiniPlayer and MediaCard no longer nest a `<button>` inside a `<button>` on web (React logged a hydration error on every screen with a MiniPlayer). With `onPress`, the bar's or card's press target is now a full-size sibling behind the content instead of the ancestor of the play/skip and overlay buttons; the pressable props go to that target and the `ref` to the bar/card. A `plain` MediaCard is no longer rounded: its text runs to the card's edges, and the rounded clip cut the first letters of the last line ("n progress").
- abf21f4: `CalendarHeatmap`: a `backgroundColor` in `styled.styleCell` now sets only the empty track; the level fills are drawn over it, so a custom track colour no longer repaints every filled day as empty.
- 7e91533: `ListItem`: padding written on `styled.style` now pads the row in place of its default 16 × 8 instead of adding to it, and the divider no longer follows that padding — it starts at the list's `dividerInset` (`0` is flush). A design that compensated for the doubled padding gets less padding now.
- b869b58: The errors thrown when an optional package is missing at runtime (QRCode's `react-native-qrcode-svg`, an icon family's `@react-native-vector-icons/*` pack, MapView's `react-native-maps`) now name both ways to fix it: enable the package in the Creator's Project settings → Packages for a Creator-first app, or run `mapples sync` and then the install command it names for a code-first app, where the sync has already put the dependency in package.json. They used to point only at the Creator.
- 66caff0: `BottomNavigationBar` / `TabBarItems` with `indicator: 'expand'`: the height and padding in `styleIndicator` now size the pill itself, instead of reaching only the fill layer inside it — a design's pill no longer needs negative offsets on the indicator.
- e309e8f: fix(BottomNavigationBar, TabBarItems): an `expand` indicator with a `styleIndicator` slot crashed the web canvas ("Failed to set an indexed property [0] on 'CSSStyleDeclaration'"). On the canvas a slot arrives as a nested array (`[base, condition && variant]`), and the item split it with lodash `pick`/`omit`, which turned the array's indices into style keys. The slot is now flattened first, so its offsets and fill also apply instead of being dropped.
- 35e9ba6: Guards on navigator routes, built-in glyph tab icons, and storyboard placement fixes (RC #16, #20, #21, #22, #33, #34).
  - `@mapples/types`: a guard on a route that enters a nested navigator protects the whole section; the validator rejects a fallback inside the guarded section (`navigatorRouteIds`). Tab / drawer icons accept a built-in glyph, `ref(glyph:<family>:<name>)` (`buildGlyphRef` / `parseGlyphRef`), besides an icon asset.
  - `@mapples/navigation`: navigator routes honour their guard (`RouteGuard`); guard redirects reset the history instead of pushing (`replace` on `mapples:navigate`), and navigating from a guard's fallback into the area it guards (sign in → signed-in area) resets it too, so no back arrow leads into or out of a protected area. `ref(glyph:…)` icons render through the host's registered `Icon` component.
  - `@mapples/components`: a `TabBarItems` / `BottomNavigationBar` item without an icon is a label-only tab (pill behind the label) instead of an empty pill.
  - `@mapplesorg/canvas`: frames and designed bars draw glyph tab icons; a stock bar's tab without an icon is label-only, not a grey square; the frame tab bar no longer asks the project typography for the editor's `caption` / `overline` variants; guarded sections get a "Guarded" chip and an amber arrow to their fallback; placing a section or screen from the palette commits the drawn cells of its container, so the new item lands where it was clicked instead of pushing unplaced neighbours around; zoom-to-fit includes sections; `IconNameGrid` is exported.
  - `@mapplesorg/ai-tools`: `set_route_guard` covers navigator routes; `set_route_options` takes glyph refs for `tabIcon` / `drawerIcon`.

## 1.2.1

### Patch Changes

- 264ed6e: `ButtonGroup` provides `ButtonGroupContext` instead of wrapping every child in a cell, so its buttons take equal shares wherever the children come from (an editor rendering them through its own drop area included); buttons no longer need `fullWidth` for it. Overlay layers (`Dialog`, `BottomSheet`, `ActionSheet`, `Snackbar`) take their minimum height from the style provider's canvas dimensions when set and the window height otherwise, so a centred dialog no longer lands below a phone-sized frame. Bottom- and top-aligned overlay content now fills the layer, so `BottomSheet`'s percent `maxHeight` resolves against the layer instead of the sheet's own height — the sheet no longer shrinks and lifts off the bottom edge.

## 1.2.0

### Minor Changes

- 92b5e73: The themed component library. `@mapples/components` gains 48 components across six groups — actions, inputs, content, navigation, feedback and overlays — that paint themselves from the project theme and ship a canvas schematic each; `ImageCarousel` moves under `content/` alongside them, and `expo-image`, `react-native-gesture-handler` and `lodash` join the package's dependency surface.

  `@mapples/ui` adds the design tokens (control sizes, radii, elevation, state-layer opacities) and the `useTones` hook the library paints from, deriving neutrals from the text colour at an alpha so they invert with the theme; `Button`, `IconButton`, `SubmitButton` and `TextInput` gain themed `variant`s (`filled`, `tonal`, `outlined`, `text`, `elevated`) behind an optional prop — left unset they render exactly as before.

  `@mapples/style` adds `withAlpha`, which rewrites a resolved colour at a given alpha and throws on an unresolved token. `@mapples/app` mounts a `GestureHandlerRootView` above the rendered tree, which the gesture-driven components (`Slider`, `BottomSheet`) need, and takes `react-native-gesture-handler` as a peer dependency.

## 1.1.2

### Patch Changes

- 6150aa1: Update typography handling logic and resolve minor isssue

## 1.1.1

### Patch Changes

- f2313c2: feat: introudce navigation component

## 1.1.0

### Minor Changes

- 77277bc: Update to rn 56

## 1.0.1

### Patch Changes

- b39e19e: feat: create image carousel base component
- b39e19e: chore: remove unused ImageCarouselDataItem import
- b39e19e: feat: update styles

## 1.0.0

### Major Changes

- 53fb55e: feat: introduce components package
