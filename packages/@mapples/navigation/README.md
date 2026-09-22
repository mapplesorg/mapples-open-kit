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

## Route params, on-enter actions and guards

Every page screen is wrapped in `RouteScreen`, which applies what its `RouteNode` declares:

- **Params.** A route with `path: '/product/:id'` expects an `id`. A `mapples:navigate` action supplies it under `payload.data.params` — a literal, or a value source resolved at press time (`{ kind: 'data', path: 'id' }` reads the pressed list row when the element's action `dataProp` is `(this)`; `{ kind: 'state', dataProp: 'vars.selected' }` reads state). The screen reads them as `route.<token>` bindings, and root-mounted handlers read the focused screen's through `ActiveRouteProvider` (mount one above `MapplesNavigation`).
- **On enter.** `onEnter: { type, staticData }` is emitted on every focus, with the params as the event value and merged into the data — `{ type: 'mapples:request', staticData: { requestId } }` loads a screen's own data.
- **Guard.** `guard` is a condition in the element-visibility grammar (`vars.session.token::isNotEmpty::`); while it fails the screen renders nothing and the user is sent to `guardFallbackRouteId`. Access checks only — data readiness is a `_visible` binding on `api.<name>.loading`.

## Ref resolution

Option values may be `ref(theme:<uuid>:<name>)` (resolved against `@mapples/style`)
or `ref(icon:<uuid>:<name>)` (resolved against the `@mapples/render` assets map).
Unresolvable refs fall back to a default and `console.warn` rather than crashing.

## Peer dependencies

`@react-navigation/*` ship as direct dependencies; `react-native-screens`,
`react-native-safe-area-context`, `react-native-gesture-handler` and
`react-native-reanimated` are peer dependencies provided by the host app.
