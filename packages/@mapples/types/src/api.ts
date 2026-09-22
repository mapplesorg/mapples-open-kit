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
  | { kind: 'event'; path?: string };

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
  /** JSON body template; leaf values may be {@link ApiValueSource}s. */
  body?: { kind: 'json'; template: unknown };
  auth?: ApiRequestAuth;
  /**
   * A sample response powering design-time binding pickers and sample-mode
   * execution in the editor preview.
   */
  responseSample?: unknown;
  /**
   * State path the response lands under (`api.<name>` by default). Bindings
   * read `<stateKey>.data`, `<stateKey>.loading`, `<stateKey>.error`.
   */
  stateKey?: string;
}

export interface ApiDocument {
  version: 1;
  /** The environment used by the editor preview. */
  activeEnvironmentId?: string;
  environments: Record<string, ApiEnvironment>;
  requests: Record<string, ApiRequest>;
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
