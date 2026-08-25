---
'@mapples/style': minor
'@mapples/ui': patch
---

`SvgStyle`: a dedicated style type for SVG-rendering components (view geometry plus `color`), replacing the `TextStyle` stand-in that breaks under `react-native-web`'s widened `cursor` typing; `zIndex` rejects malformed values instead of dropping them. `@mapples/ui` types icon SVG styles as `SvgStyle` and lets an unencodable barcode surface an error instead of rendering blank.
