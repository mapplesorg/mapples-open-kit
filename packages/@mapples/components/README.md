# @mapples/components

A neutral, theme-driven component library for Mapples apps — the widgets a
real product needs (actions, inputs, content, navigation, feedback and
overlays) on top of the `@mapples/ui` primitives. Every component paints
itself from the project theme, works on iOS, Android and the web, is placed
from the Creator palette, and is described to the AI assistant.

## Installation

```bash
npm install @mapples/components
```

Peers: `react`, `react-native`, `react-native-svg`, `expo-image`,
`react-native-gesture-handler` (drag input for `Slider` and `BottomSheet`;
wrap the app in `GestureHandlerRootView` — `MapplesApp` does).

## Usage

```tsx
import { Components } from '@mapples/components';
import { RenderProvider } from '@mapples/render';
import { UIComponents } from '@mapples/ui';

<RenderProvider components={{ ...Components, ...UIComponents }} assets={assets}>
  {children}
</RenderProvider>;
```

Or directly:

```tsx
import { InputField, Switch, Card } from '@mapples/components';

<Card variant="outlined">
  <InputField label="Email" value={email} onChangeText={setEmail} />
  <Switch label="Remember me" value={remember} onValueChange={setRemember} />
</Card>;
```

## Inventory

| Area | Components |
| --- | --- |
| Actions | `Fab`, `Chip`, `ChipGroup`, `SegmentedControl`, `ButtonGroup`, `BottomActionBar` (plus the themed `Button` / `IconButton` of `@mapples/ui`) |
| Inputs | `InputField`, `SearchBar`, `PinInput`, `SelectField`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `NumberStepper`, `Rating`, `ChatComposer` |
| Content | `Card`, `MediaCard`, `ListItem`, `List`, `SectionHeader`, `Divider`, `Avatar`, `AvatarGroup`, `Accordion`, `StatTile`, `Table`, `Timeline`, `MessageBubble`, `ImageCarousel` |
| Navigation | `TopAppBar`, `BottomNavigationBar`, `Tabs`, `Breadcrumbs`, `PageControl`, `Steps`, `TextLink` |
| Feedback | `Badge`, `ProgressBar`, `ProgressCircle`, `Spinner`, `Skeleton`, `Banner`, `Snackbar`, `EmptyState` |
| Overlays | `Dialog`, `BottomSheet`, `ActionSheet` |

## Conventions

- **Theme first.** Colours come from the project theme through the palette
  contract (`primary`, `accent`, `background`, `text`, `system`); neutral
  surfaces (outlines, fills, dividers, scrims) derive from the text colour at
  an alpha so they read on light and dark themes alike. Sizes and radii come
  from `CONTROL_SIZES` and `RADII` in `@mapples/ui`.
- **Defaults live in the component.** `styled` slots (`style`, `styleLabel`,
  `styleTrack`, …) merge over the runtime defaults; delete an override and
  the default is back.
- **One state contract.** Form-like controls take `value` and report
  `onValueChange(next)`; text controls use `onChangeText`; toggles
  `selected` / `onSelectedChange`; `Accordion` `expanded` /
  `onExpandedChange`; overlays `visible` / `onVisibleChange`. The new value
  is always the first handler argument, so a Creator two-way binding needs no
  configuration. Omit the value prop and the component keeps its own state;
  pass `fieldName` inside a `FormView` and the value binds to the form.
- **Lists are literal.** Selectable lists take `options: [{label, value,
  iconName?, disabled?, destructive?}]`; display lists take `items` with a
  fixed shape per component; only `Table` and `ImageCarousel` remap external
  data through `keyMap`.
- **Icons.** `…IconName` props render a glyph from the project's icon family
  (`Icon` from `@mapples/ui`); the check marks, chevrons and other structural
  glyphs are built in.
- **Overlays are in-tree.** `Dialog`, `BottomSheet`, `ActionSheet` and
  `Snackbar` cover the parent they are placed in — put them last in the page
  root and drive `visible` from state.
- **Accessible by default.** Roles, states and values are set; small
  controls carry a 44 pt hit area; loops and transitions respect the
  reduce-motion setting.
- **Non-goals (for now).** Date/time pickers, anchored menus, tooltips,
  drawers, range sliders and charts.

## Development

```bash
npm run build
npm run type-check
npm run lint
```

## License

MIT

## Author

Oleksandr Soloviov – [mapples.org](https://mapples.org/people/olek_soloviov)
