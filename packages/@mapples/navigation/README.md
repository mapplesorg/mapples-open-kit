# @mapples/navigation

Runtime interpreter for the Mapples `NavigationDocument`. Renders a document with
React Navigation (stack / tabs / drawer) and bridges navigation actions emitted
through `@mapples/action`.

> ⚠️ **Canonical home is `mapples-open-kit`.** This copy is the in-monorepo mirror
> used so the Creator preview can develop against it. Sync changes to open-kit
> before publishing; do not release from this repo.

## Usage

```tsx
import { MapplesNavigation } from '@mapples/navigation';

<MapplesNavigation
  document={navigationDocument}
  pages={{ 'page-uuid': HomeScreen }}
  fallback={({ pageUuid }) => <Missing pageUuid={pageUuid} />}
  independent // when the host already owns a NavigationContainer (expo-router)
/>;
```

## Actions

Components emit these `Action.type` strings (see `NavigationActionType`):

| Type | `payload.data` | Effect |
| --- | --- | --- |
| `mapples:navigate` | `{ routeName?, pageUuid?, params? }` | Navigate to a route / page |
| `mapples:goBack` | — | Pop the current screen |
| `mapples:openDrawer` | — | Open the nearest drawer |
| `mapples:closeDrawer` | — | Close the nearest drawer |
| `mapples:switchTab` | `{ routeName }` | Switch to a sibling tab |

## Ref resolution

Option values may be `ref(theme:<uuid>:<name>)` (resolved against `@mapples/style`)
or `ref(icon:<uuid>:<name>)` (resolved against the `@mapples/render` assets map).
Unresolvable refs fall back to a default and `console.warn` rather than crashing.

## Peer dependencies

`@react-navigation/*` ship as direct dependencies; `react-native-screens`,
`react-native-safe-area-context`, `react-native-gesture-handler` and
`react-native-reanimated` are peer dependencies provided by the host app.
