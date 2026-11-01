/**
 * @fileoverview The project API document: a catalog of HTTP request
 * definitions and environments, editable in the Creator and executed by the
 * `mapples:request` action runtime.
 *
 * Persisted as one opaque row per project (mirroring the navigation
 * document); validated client-side by `validateApiDocument`.
 */

/** Where a request parameter/body value comes from at execution time. */
export type ApiValueSource =
  /** A literal string. */
  | { kind: 'static'; value: string }
  /** A state binding resolved via `@mapples/state` (dot path). */
  | { kind: 'state'; dataProp: string }
  /**
   * A value from the triggering action's event payload (e.g. form values,
   * input text). `path` narrows into the payload; omitted = whole payload.
   */
  | { kind: 'event'; path?: string }
  /**
   * A value from the triggering action's resolved data (`Action.payload.data`):
   * what the element's `dataProp` resolved in its own scope — a list row's
   * item when the element binds `(this)` — merged with its `staticData`, or a
   * route's params for an on-enter action. `path` narrows into it; omitted =
   * the whole value. The way a row-scoped value reaches a request, which a
   * `state` source (resolved where the runtime is mounted) cannot see.
   */
  | { kind: 'data'; path?: string };

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiEnvironment {
  id: string;
  /** e.g. `Development`, `Production`. */
  name: string;
  /** Base URL prepended to relative request paths. */
  baseUrl: string;
  /** Headers merged into every request of this environment. */
  headers?: Record<string, string>;
  /** Interpolated into url/header templates as `{{variable}}`. */
  variables?: Record<string, string>;
}

export interface ApiRequestAuth {
  kind: 'none' | 'bearer' | 'header';
  /** Header name for `kind: 'header'` (defaults to `Authorization`). */
  header?: string;
  /**
   * Name of a project API key (or exported-app env variable) holding the
   * secret. Literal secrets are never stored in the document.
   */
  secretRef?: string;
}

/**
 * What a request previews with when nothing has really run: the data states an
 * author or an agent saved for it.
 */
export interface ApiRequestStates {
  /** The response body. Wins over {@link ApiRequest.responseSample}. */
  success?: unknown;
  /** The failure: its HTTP status and body. */
  error?: { status: number; body: unknown };
  /** What `data` holds while loading, for skeleton content. */
  loading?: unknown;
}

export interface ApiRequest {
  id: string;
  /** Unique per document; doubles as the default state key suffix. */
  name: string;
  method: HttpMethod;
  /**
   * Request path — `/users/{id}` (tokens bound via {@link params}) — or an
   * absolute URL, which bypasses the environment's `baseUrl`.
   */
  path: string;
  headers?: Record<string, string>;
  /**
   * Values for `{token}` path segments and (for non-token keys) the query
   * string.
   */
  params?: Record<string, ApiValueSource>;
  /**
   * Headers read when the request runs — a signed-in user's token from
   * `vars.sessionToken`. `prefix` goes in front (`Bearer `). A value that
   * resolves to nothing or to `''` leaves the header out; wins over
   * {@link headers}.
   */
  headerValues?: Record<string, { source: ApiValueSource; prefix?: string }>;
  /** JSON body template; leaf values may be {@link ApiValueSource}s. */
  body?: { kind: 'json'; template: unknown };
  auth?: ApiRequestAuth;
  /**
   * A sample response powering design-time binding pickers and sample-mode
   * execution in the editor preview.
   */
  responseSample?: unknown;
  /** The request's saved data states; see {@link ApiRequestStates}. */
  states?: ApiRequestStates;
  /**
   * State path the response lands under (`api.<name>` by default). Bindings
   * read `<stateKey>.data`, `<stateKey>.loading`, `<stateKey>.error`.
   */
  stateKey?: string;
}

/** The body a request previews with on success. */
export const apiRequestSuccessState = (
  request: Pick<ApiRequest, 'states' | 'responseSample'>,
): unknown => request.states?.success ?? request.responseSample;

/**
 * How the app renews a signed-in session. When a request answers 401 while
 * a session is held, the runtime runs the refresh request once, writes the
 * variables from its response and retries the request; when the refresh is
 * refused, the session variables are emptied so the guards take over.
 */
export interface ApiSession {
  /** The request that renews the session (its id). It is never refreshed itself. */
  refreshRequestId: string;
  /**
   * Variables written from the refresh response: the variable's path → the
   * path of the value in the body (`{ 'vars.sessionToken': 'access_token' }`).
   * While every one of them is empty there is no session to renew, so a 401
   * is reported as it is.
   */
  writes: Record<string, string>;
  /**
   * Variables set to `''` when the refresh is refused, so a guard on the
   * session sends the user to sign in. Defaults to the written ones.
   */
  clears?: string[];
}

export interface ApiDocument {
  version: 1;
  /** The environment used by the editor preview. */
  activeEnvironmentId?: string;
  environments: Record<string, ApiEnvironment>;
  requests: Record<string, ApiRequest>;
  /** How the app renews a signed-in session; absent → a 401 is a failed request. */
  session?: ApiSession;
}

/**
 * Root of every request state key. Responses live in their own context, which
 * scope providers (a frame's data state, a list row) never shadow, so
 * `api.*` bindings resolve the same anywhere in the tree — the way `vars.*`
 * does. `validateApiDocument` rejects a state key outside this namespace.
 */
export const API_NAMESPACE = 'api';

/** The default state key a request's responses are stored under. */
export const apiRequestStateKey = (request: ApiRequest): string =>
  request.stateKey || `${API_NAMESPACE}.${request.name}`;
