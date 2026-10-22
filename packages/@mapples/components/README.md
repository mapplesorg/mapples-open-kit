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

Optional peer: `react-native-maps` (`npx expo install react-native-maps`) for
`MapView` on iOS and Android — a native module, so rebuild the dev client;
Android also needs a Google Maps API key (the `react-native-maps` config
plugin's `androidGoogleMapsApiKey`). Without it a native `MapView` throws;
the web build draws a static map and never imports it.

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

| Area       | Components                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions    | `Fab`, `Chip`, `ChipGroup`, `SegmentedControl`, `ButtonGroup`, `BottomActionBar` (plus the themed `Button` / `IconButton` of `@mapples/ui`)                                                                                                                                                                                               |
| Inputs     | `InputField`, `SearchBar`, `PinInput`, `SelectField`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `RangeSlider`, `NumberStepper`, `Rating`, `DayPicker`, `Calendar`, `TimePicker`, `ChatComposer`, `NumericKeypad`, `ChoiceGrid`                                                                                                        |
| Content    | `Card`, `MediaCard`, `TicketCard`, `ListItem`, `List`, `ReorderableList`, `SectionHeader`, `Divider`, `Avatar`, `AvatarGroup`, `Accordion`, `StatTile`, `Table`, `Timeline`, `BarChart`, `LineChart`, `CalendarHeatmap`, `DateTile`, `MessageBubble`, `ImageCarousel`, `MasonryGrid`, `PlaybackControls`, `WaveformSeekBar`, `MiniPlayer`, `MapView` |
| Navigation | `TopAppBar`, `BottomNavigationBar`, `Tabs`, `Breadcrumbs`, `PageControl`, `Steps`, `TextLink`                                                                                                                                                                                                                                             |
| Feedback   | `Badge`, `ProgressBar`, `ProgressCircle`, `CountdownTimer`, `ActivityRings`, `BreathingGuide`, `Spinner`, `Skeleton`, `Banner`, `Snackbar`, `EmptyState`                                                                                                                                                                                  |
| Overlays   | `Dialog`, `BottomSheet`, `ActionSheet`                                                                                                                                                                                                                                                                                                    |

## Conventions

- **Theme first.** Colours come from the project theme through the palette
  contract (`primary`, `accent`, `background`, `text`, `system`); neutral
  surfaces (outlines, fills, dividers, scrims) derive from the text colour at
  an alpha so they read on light and dark themes alike. Sizes, radii,
  outline widths and the elevation come from the project shape in
  `@mapples/ui` (`useShape()`, `useElevation()` — the sizing keys `radius`,
  `radiusLarge`, `control`, `borderWidth`, `shadowOffset`; see the
  `@mapples/ui` README).
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
