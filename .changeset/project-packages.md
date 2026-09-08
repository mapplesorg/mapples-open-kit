---
'@mapples/types': minor
'@mapples/ui': minor
---

Project packages: `@mapples/types` adds the packages document contract (`PackagesDocument` — the
enabled package ids plus the resolved install list the CLI reads — with a structural validator that
mirrors the variables document). `@mapples/ui` makes every `@react-native-vector-icons` pack,
`react-native-qrcode-svg`, `jsbarcode`, `expo-linear-gradient` and `expo-video` optional peer
dependencies resolved with a try-wrapped require (Metro `allowOptionalDependencies`): a consumer
installs only what its project uses, and a family or runtime whose package is missing throws a
descriptive error at render instead of drawing a placeholder. `expo-image` and `expo-video` are
declared as peers.
