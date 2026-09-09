# @mapples/components

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
