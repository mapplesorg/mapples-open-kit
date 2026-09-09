# @mapples/style

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
