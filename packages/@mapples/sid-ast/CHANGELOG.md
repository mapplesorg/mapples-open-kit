# @mapples/sid-ast

## 2.1.1

## 2.1.0

### Minor Changes

- 6976f74: The release after 2.0.1 is 2.1.0 (owner, 2026-11-12). This minor changeset moves the whole fixed group, every `@mapples/*` and `@mapplesorg/*` package, from 2.0.4 to 2.1.0.

### Patch Changes

- d6dc247: Style variants under a data state work in generated code. A page element whose style changes while a Creator state holds (`'style::<state>'` under a state such as `vars.count::gt::3`) was printed without the condition, so an app built from the file never applied it.
  - `@mapples/sid-ast`: an element with such a variant declares the state in a new `$states` attribute, `$states={{ '<state>': { condition: 'vars.count::gt::3', name: 'High' } }}`, next to the unchanged `'style::<state>'` entry. Generated output changes only for elements that have these variants; prop states still print as code (`[styles.card, isActive && styles.cardActive]`) and `style::$pressed` needs no declaration. `extract` returns the declared states in `states` (never as a node prop), so `extract(emit(dom))` gives the same tree and the same states. New `syncElementStates(source, states)` sets every element's `$states` from a document's states (`patch` runs it when given `states`), new exports `elementStates` and `STATES_ATTR`.
  - `@mapples/codegen`: `adoptPropConditions` takes only the file's prop states from the file; a data state stays as the document has it.
  - `@mapples/render`: `MapplesElement` takes `$states` and applies a `key::state` variant while that state's condition holds on the app's data state.

- 4478367: Adoption fixes from linking an existing Expo Router app:
  - `scanComponents` names a file after its default export: it resolves `export default Foo`, `memo(Foo)`, `forwardRef(Foo)` and `export { Foo as default }`, lists the default export first, and no longer counts a SCREAMING_CASE or literal constant (`export const ICON_STROKE_WIDTH = 1`) as a component. New field `anonymousDefault`: the default export has no name in code, so the caller names it.
  - `codemodAdopt` tags member-expression elements (`<Animated.View>`) as a `Custom` whose importRef carries the member path (`react-native-reanimated#default.View`), so their children keep a parent in the tree; extraction resolves such a tag the same way.
  - A `MULTIPLE_ROOTS` warning names why the tree is split: another `return`, JSX in a helper or variable, a fragment root, a conditional around the root, or an element the canvas cannot read as the parent.
  - A react-native name the swap replaces but the file also uses as a type (`useRef<ScrollView>`) keeps react-native's under a type-only alias (`type ScrollView as RNScrollView`), so the file still compiles. A swapped `ScrollView` gets `showsVerticalScrollIndicator={true}` unless it sets it (the `@mapples/ui` one hides the indicator by default). New result field `changed`: swaps to a different component (`Pressable` -> `Button`).
  - A linked component used with children is tagged as a `Custom` holding them: a component instance has no children slot.

  **Breaking:** adoption output changes (component names, the `showsVerticalScrollIndicator` attribute, the type alias, unlinked uses with children). A member-tag `Custom` stores an importRef like `react-native-reanimated#default.View`, which `@mapples/codegen` 2.0.x and `mapples` 2.0.1 turn into an invalid `import { default.View }`: every client syncing such a project needs this version or later.

- 647b81f: - A chained conditional (`a ? <X/> : b ? <Y/> : <Z/>`) guards each branch it can express as one prop test — `prop === 'v'` after earlier tests of the same prop against other values — and warns `UNSUPPORTED_CONDITION` for every other branch. The later branches used to come out unguarded and unwarned, so the canvas drew all of them at once.
  - New warning `ICON_NAME_ON_VECTOR`: an `iconName` (literal or bound) on a `Vector`, which draws an SVG from `uri` only and shows the image placeholder.
  - `patch` keeps the file valid when the Creator removes or moves an element inside a `{…}` expression: a removed ternary branch becomes `null`, an `&&`-guarded element is removed or moved with its guard, inserts and moves anchor before a sibling's whole expression, and a ternary branch is not moved on its own (reported instead). Cutting only the element used to leave `cond ? ( ) :`, which does not parse.
- ffd671f: `@mapples/style` elements are read as their `@mapples/ui` types instead of placeholders (mapplesorg/mapples#97).

  `@mapples/sid-ast`: a `$sid` element imported from `@mapples/style` as `StyledView`, `StyledSafeAreaView`, `StyledScrollView`, `StyledPressable`, `StyledTextInput`, `StyledText` or `Typography` extracts as `View`, `SafeAreaView`, `ScrollView`, `Pressable`, `TextInput`, `Text` or `Typography`, with no `fallbackSize`. The file keeps the element as written: a Creator prop change is patched onto it in place. The text children of a `Typography` are its `text` prop on the canvas (the `@mapples/ui` `Typography` renders only `text`), and a Creator text change is written back as the children. `codemodAdopt` tags these elements as they are, with no swap and no `$fallback`. `ExtractResult.styleElements` lists the sids written this way. An element adopted earlier as a `Custom` placeholder is read under its new type on the next sync, and its leftover `$fallback` attribute is dropped.

  `@mapples/codegen`: `importNeedsFor(root, writtenAs)` skips the `@mapples/ui` import of the sids in `writtenAs`, so healing never adds an unused `View` import to a file that writes `<StyledView>`.

  Breaking (included in 2.1.0, owner 2026-11-16): `ExtractResult` gains the required `styleElements`, and extraction and adoption output change for `@mapples/style` elements (an element adopted earlier as a `Custom` placeholder changes type on the next sync).

## 2.0.4

## 2.0.3

## 2.0.2

### Patch Changes

- 9cec45c: `normalizeJsxText` runs in linear time: long runs of spaces or tabs no longer make the whitespace regex rescan them (CodeQL `js/polynomial-redos`). Results are unchanged.

## 2.0.1

### Patch Changes

- fdd8822: A generated component file declares the props its document binds and passes them on (title={title}), instead of printing a $data binding the built app can't resolve.
- ec66663: An instance that leaves a prop out renders the default its file declares: props passed on to a nested component are bindings, an unset binding keeps the master's default, and Typography renders nothing for an unset text instead of 'Not a string'.

## 2.0.0

### Major Changes

- cffb0d6: Mapples 2.0: every `@mapples/*` and `@mapplesorg/*` package is released as 2.0.0, together with the `mapples` CLI 2.0.0. Apps generated by the CLI depend on `@mapples/*` `^2.0.0`.

### Minor Changes

- a6c5872: All `@mapples/*` runtime packages now share one version and are versioned and published together from `mapplesorg/mapples-kit`; `mapples-open-kit` is a read-only mirror of the source.
- a6c5872: Published as Node ESM (`type: module`, `.js` import suffixes) from `mapples-kit`; the `mapples` CLI now consumes both from npm.
- 0e97063: A component file that passes a declared prop straight on to a primitive — `title={title}`, `title={props.title}`, or `<Text>{label}</Text>` as the only content — now extracts it as a `props.<name>` data binding (`dataProps.title = { key: 'props.title', active: true }`) instead of a `NON_LITERAL_PROP` warning, so the canvas renders an instance with the values it was given. The file keeps the code: `patch` never writes those bindings into `$data`, keeps the bound text, and warns when the document asks for a different binding or text there (`ElementInfo.propBindings`, `AttrInfo.propBinding`). `isPropBinding(key)` is exported. `@mapples/codegen`: `adoptPropConditions` also takes a file's pass-through bindings over the document's, like its prop guards and style variants.
- ddda791: Clearer warnings with an optional `severity` (`info` for code the canvas just can't mirror, such as an event handler). Event props (`isEventProp`) are always code the file owns and never store a value. `@mapples/components` imports count as canvas elements. New `moveNamedImports` re-homes misplaced named imports, and `ensureInstanceStyled` / `isInstanceWrapper` give a component a `styled` prop applied through a `<View styled={styled}>` around its root.

### Patch Changes

- 35e9ba6: Creator behaviour runs in the exported app.
  - `@mapples/app`: `MapplesApp` mounts the behaviour runtime (`MapplesRuntime`) — action bus, project variables (`vars.*`) with the `mapples:setState` handler, the API runtime (`api.*`, real requests via `fetch` with secrets from `EXPO_PUBLIC_MAPPLES_SECRET_<NAME>`, or a custom `transport`) with the `mapples:request` handler, the focused route's params, and `RouterActionHandler`, which drives expo-router with the same `toNavigationCommand` semantics as Play (navigate pushes; guard redirects, `replace` and sign-in into a guarded area reset the history). It reads `mapples/navigation.ts`, `mapples/api.ts` and `mapples/variables.ts` through `mapplesResolver` (new `mapples::navigation|api|variables` modules). CLI-generated layouts wrap screens with `mapplesScreens(...)` (`MapplesScreen`: params, on-enter action, guard + fallback, page-scoped variables; `RouteGuard` for a route entering a nested navigator) and render tab/drawer icons with `RouteIcon`. New peers: `@mapples/action`, `@mapples/navigation`, `@mapples/request`, `@mapples/state`, `rxjs`; `expo-router` is no longer optional.
  - `@mapples/render`: `useElementBindings` / `useActionHandlers` — the one implementation of data bindings, `_visible`, asset refs and actions — shared by `RenderComponent` and the new `MapplesElement`, which `babel-plugin-mapples-sid` renders every element carrying `$data` / `$actions` / `$refs` through.
  - `@mapples/navigation`: exports `RouteScreen` / `RouteGuard`; a screen's blur no longer wipes the params the next focused screen already published (on-enter requests reading `route.*` could stall); Play's navigators take header visibility, titles and tab/drawer labels from the shared `routeHeaderVisible` / `routeTitle` / `routeItemLabel` (a route entering a nested navigator no longer draws a second header); `entersGuardFromFallback` also counts the guards on the nested initial route chain a navigate lands on, so signing in to a route whose nested area is guarded resets the history in Play and the exported app.
  - `@mapples/state`: `ActiveRouteState.releaseParams`.
  - `@mapples/types`: `routeHeaderVisible`, `routeTitle`, `routeItemLabel` — the header/title/label rules the canvas frame chrome and the generated layouts share (a route entering a nested navigator draws no header of its own).
  - `@mapples/style`: styled styles accept a `boxShadow` object `{ x, y, radius, color }` in their types, as the styler already rendered it.
  - `@mapples/sid-ast`: a newly added attribute (a binding's `$data`) goes right after the last attribute — no double space, and the space before `/>` stays.
  - `@mapplesorg/canvas`: frame chrome follows the shared header rule (no `Auth`/`Auth` double header); switching an action's type drops the previous type's `staticData` keys (no stale `pageUuid` on a set-variable action).

- bc0d0c4: A component file that passes one of its own props on as an event handler (`<Pressable onPress={onPress}>`, or `props.onPress`) now records it on that element as a `props.onPress` binding, the way `title={title}` already records `props.title`. The canvas can then run the handler an instance is given, so a card or back button whose action sits on the instance works in Play. The binding stays the code's: a Creator edit never writes it into `$data`, and the element no longer reports the "runs your code in the app" info warning.
- 396a4a9: `extract` names what the canvas cannot hold instead of losing it silently:
  - A `$sid` tree beyond the file's first (another `return`, a helper) gets a `MULTIPLE_ROOTS` warning with its line — the document has one root, and that tree is not read.
  - A style variant whose test is not on one prop (`[styles.chip, selected && showCheck && styles.check]`, a ternary on a local) is dropped with an `UNSUPPORTED_CONDITION` warning naming the expression; the base style and the readable variants are kept, where the whole `styled` used to be lost behind a vague `NON_LITERAL_PROP`. The attribute stays code-owned, so a Creator edit never reprints it without the dropped variant.
  - A guard the canvas cannot read (`{selected && showCheck ? <Icon /> : null}`) gets an `UNSUPPORTED_CONDITION` warning saying the canvas always shows the element.

  The Creator's code editor refuses a file with a second tree before saving it.

- 7a49679: `codemodAdopt` (which `mapples sync` runs on untagged elements) writes `$sid` after the tag's last attribute — on its own line when the attributes are on their own lines — instead of right after the tag name, so the tag's first line keeps its text. `extract` warns `INLINE_ASSET_REF` for a `ref(…)` asset string written into a prop's data, naming the `$refs` path key to use instead.
