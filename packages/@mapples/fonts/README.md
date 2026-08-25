# @mapples/fonts

The font library bundled with every Mapples project: 12 open-licensed (OFL)
Google Fonts families, registered **per weight** (`Inter-SemiBold`) the way
React Native expects, so the same family name renders identically in the
Creator canvas (web + native) and in the exported app.

```ts
import { FONT_FILES, FONT_FAMILIES, fontFamilyName } from '@mapples/fonts';

useFonts(FONT_FILES);                 // expo-font — load everything once
fontFamilyName('Manrope', 'Bold');    // 'Manrope-Bold'
```

`FONT_FAMILIES` / `FONT_META` are the closed set the AI design generator is
schema-locked to — it cannot name a font that is not shipped here.
