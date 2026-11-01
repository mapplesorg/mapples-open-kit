import { API_NAMESPACE, ApiDocument, apiRequestStateKey } from './api';

/**
 * Codes for the invariants enforced by {@link validateApiDocument}.
 *
 * - `REQUEST_NAME_INVALID` — a name that can't be a segment of a binding path.
 * - `REQUEST_NAME_DUPLICATE` — two requests share a name.
 * - `PATH_EMPTY` — a request has no path.
 * - `ENVIRONMENT_MISSING` — `activeEnvironmentId` has no matching environment.
 * - `PATH_PARAM_UNBOUND` — a `{token}` in a request path has no params entry.
 * - `BODY_ON_GET` — a GET request declares a body.
 * - `STATE_KEY_COLLISION` — two requests resolve to the same state key.
 * - `STATE_KEY_NAMESPACE` — a state key sits outside the `api.` namespace.
 * - `SECRET_REF_EMPTY` — auth requires a secret but `secretRef` is empty.
 * - `SESSION_REQUEST_MISSING` — `session.refreshRequestId` names no request.
 * - `SESSION_WRITES_EMPTY` — `session.writes` names no variable.
 */
export type ApiValidationCode =
  | 'REQUEST_NAME_INVALID'
  | 'REQUEST_NAME_DUPLICATE'
  | 'PATH_EMPTY'
  | 'ENVIRONMENT_MISSING'
  | 'PATH_PARAM_UNBOUND'
  | 'BODY_ON_GET'
  | 'STATE_KEY_COLLISION'
  | 'STATE_KEY_NAMESPACE'
  | 'SECRET_REF_EMPTY'
  | 'SESSION_REQUEST_MISSING'
  | 'SESSION_WRITES_EMPTY';

export interface ApiValidationError {
  code: ApiValidationCode;
  message: string;
  requestId?: string;
}

export interface ApiValidationResult {
  valid: boolean;
  errors: ApiValidationError[];
}

/**
 * A single-brace `{token}`. The lookarounds keep an environment variable's
 * `{{name}}` from reading as the path token `{name`.
 */
const PATH_TOKEN_PATTERN = /(?<!\{)\{([^{}]+)\}(?!\})/g;

const STATE_KEY_PREFIX = `${API_NAMESPACE}.`;

/**
 * A request's name is the last segment of its default state key
 * (`api.<name>`), so it has to be one binding-path segment: a dot or a space
 * would break every binding that reads the response.
 */
export const API_REQUEST_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Validate the structural invariants of an {@link ApiDocument}. Collects
 * every violation (same shape as `validateNavigationDocument`).
 */
export const validateApiDocument = (
  document: ApiDocument,
): ApiValidationResult => {
  const errors: ApiValidationError[] = [];

  if (
    document.activeEnvironmentId &&
    !document.environments[document.activeEnvironmentId]
  ) {
    errors.push({
      code: 'ENVIRONMENT_MISSING',
      message: `activeEnvironmentId "${document.activeEnvironmentId}" does not resolve to an environment`,
    });
  }

  const namesSeen = new Map<string, string>();
  const stateKeysSeen = new Map<string, string>();

  for (const request of Object.values(document.requests)) {
    if (!API_REQUEST_NAME_PATTERN.test(request.name)) {
      errors.push({
        code: 'REQUEST_NAME_INVALID',
        message: `Request name "${request.name}" must start with a letter or "_" and contain only letters, digits and "_"`,
        requestId: request.id,
      });
    }

    if (request.path.trim() === '') {
      errors.push({
        code: 'PATH_EMPTY',
        message: `Request "${request.name}" has no path`,
        requestId: request.id,
      });
    }

    const existingName = namesSeen.get(request.name);
    if (existingName) {
      errors.push({
        code: 'REQUEST_NAME_DUPLICATE',
        message: `Request name "${request.name}" is used by more than one request`,
        requestId: request.id,
      });
    } else {
      namesSeen.set(request.name, request.id);
    }

    const stateKey = apiRequestStateKey(request);
    if (
      !stateKey.startsWith(STATE_KEY_PREFIX) ||
      stateKey.length === STATE_KEY_PREFIX.length
    ) {
      errors.push({
        code: 'STATE_KEY_NAMESPACE',
        message: `State key "${stateKey}" must live under "${STATE_KEY_PREFIX}"`,
        requestId: request.id,
      });
    }

    const existingStateKey = stateKeysSeen.get(stateKey);
    if (existingStateKey) {
      errors.push({
        code: 'STATE_KEY_COLLISION',
        message: `State key "${stateKey}" is produced by more than one request`,
        requestId: request.id,
      });
    } else {
      stateKeysSeen.set(stateKey, request.id);
    }

    for (const match of request.path.matchAll(PATH_TOKEN_PATTERN)) {
      const token = match[1];
      if (!request.params?.[token]) {
        errors.push({
          code: 'PATH_PARAM_UNBOUND',
          message: `Path token "{${token}}" in "${request.path}" has no params entry`,
          requestId: request.id,
        });
      }
    }

    if (request.method === 'GET' && request.body) {
      errors.push({
        code: 'BODY_ON_GET',
        message: `GET request "${request.name}" must not declare a body`,
        requestId: request.id,
      });
    }

    if (
      request.auth &&
      request.auth.kind !== 'none' &&
      !request.auth.secretRef
    ) {
      errors.push({
        code: 'SECRET_REF_EMPTY',
        message: `Request "${request.name}" auth requires a secretRef`,
        requestId: request.id,
      });
    }
  }

  const session = document.session;
  if (session) {
    if (!document.requests[session.refreshRequestId]) {
      errors.push({
        code: 'SESSION_REQUEST_MISSING',
        message: `session.refreshRequestId "${session.refreshRequestId}" does not resolve to a request`,
      });
    }
    if (Object.keys(session.writes ?? {}).length === 0) {
      errors.push({
        code: 'SESSION_WRITES_EMPTY',
        message:
          'session.writes names no variable to write from the refresh response',
      });
    }
  }

  return { valid: errors.length === 0, errors };
};
