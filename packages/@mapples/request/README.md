# @mapples/request

Runtime for the Mapples `ApiDocument`: executes `mapples:request` actions, publishes each response as bindable state, and chains follow-up actions on the action bus.

## Installation

```bash
npm install @mapples/request
# or
yarn add @mapples/request
```

Peer dependencies: `@mapples/action`, `@mapples/state`, `@mapples/types`, `lodash`, `react`, `rxjs`.

## Usage

Mount the provider inside an `ActionProvider`, with the handler as a child:

```tsx
import ActionProvider from '@mapples/action';
import { RequestActionHandler, RequestProvider } from '@mapples/request';

const App = () => (
  <ActionProvider>
    <RequestProvider document={apiDocument} mode="fetch" secrets={secrets}>
      <RequestActionHandler />
      {/* Your app components */}
    </RequestProvider>
  </ActionProvider>
);
```

An element runs a request by emitting a `mapples:request` action:

```ts
{
  type: 'mapples:request',
  staticData: {
    requestId: '<id from the ApiDocument>',
    onSuccess: { type: 'mapples:navigate', data: { routeName: 'Home' } },
    onError: { type: 'mapples:navigate', data: { routeName: 'Error' } },
  },
}
```

## Response state

A request's response lands under its state key — `api.<name>` by default, always inside the `api.` namespace:

| Binding              | Value                                       |
| -------------------- | ------------------------------------------- |
| `api.<name>.loading` | `true` while the request is in flight       |
| `api.<name>.data`    | The parsed JSON body (`null` when not JSON) |
| `api.<name>.error`   | `HTTP <status>` or the failure message      |
| `api.<name>.status`  | The HTTP status                             |

Response state lives in its own context, so `api.*` bindings resolve the same anywhere in the tree — a nested `StateProvider` (a list row, a scoped data state) doesn't shadow them.

## Value sources

Path tokens, query parameters and JSON body leaves take an `ApiValueSource`:

- `{ kind: 'static', value }` — a literal.
- `{ kind: 'state', dataProp }` — a `@mapples/state` path, resolved where the handler is mounted (`vars.*`, `api.*`, root data state).
- `{ kind: 'event', path? }` — the triggering event's first argument (form values, input text); `path` narrows into it.
- `{ kind: 'data', path? }` — the action's resolved data (`Action.payload.data`): the pressed list row when the element's action binds `(this)`, or the route's params when a screen's `onEnter` runs the request; `path` narrows into it. The way a row-scoped value reaches a request — a `state` source resolves where the handler is mounted, above the list.

A request a screen runs on enter (`RouteNode.onEnter`) binds its path token to the route param: `{ kind: 'state', dataProp: 'route.id' }` for `/product/:id` → `GET /products/{id}`. The resolver is `resolveValueSource` from `@mapples/state`, shared with the navigation runtime's route params.

## Modes

- `sample` (default) resolves the request's `responseSample` after a short delay. No call is made and the url is not resolved.
- `fetch` performs the call through the transport.

## Transport

`fetch` mode calls a `RequestTransport`. The default is a direct `fetch` that resolves `auth.secretRef` against the `secrets` prop. Supply your own to route calls elsewhere — a backend proxy, for example — without the runtime knowing about it:

```tsx
const transport: RequestTransport = async (request) => {
  // request: { requestId, method, url, headers, body?, auth? }
  return { status, ok, headers, data };
};

<RequestProvider document={apiDocument} mode="fetch" transport={transport} />;
```

`auth` reaches the transport unresolved (it carries the secret's name), so a forwarding transport never holds the secret's value.

## Errors

Nothing fails silently:

- A `mapples:request` action with an unknown `requestId`, a path token that resolves to nothing, an undefined `{{variable}}`, or a relative path with no environment base URL throws. Pass `onRequestError` to receive those; without it they surface as uncaught errors.
- A secret that isn't configured rejects the call — the request never goes out unauthenticated.
- A rejected transport sets `api.<name>.error`, emits `onError`, and never emits `onSuccess`.
