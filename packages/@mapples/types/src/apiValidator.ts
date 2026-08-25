import { ApiDocument, apiRequestStateKey } from './api';

/**
 * Codes for the invariants enforced by {@link validateApiDocument}.
 *
 * - `REQUEST_NAME_DUPLICATE` — two requests share a name.
 * - `ENVIRONMENT_MISSING` — `activeEnvironmentId` has no matching environment.
 * - `PATH_PARAM_UNBOUND` — a `{token}` in a request path has no params entry.
 * - `BODY_ON_GET` — a GET request declares a body.
 * - `STATE_KEY_COLLISION` — two requests resolve to the same state key.
 * - `SECRET_REF_EMPTY` — auth requires a secret but `secretRef` is empty.
 */
export type ApiValidationCode =
  | 'REQUEST_NAME_DUPLICATE'
  | 'ENVIRONMENT_MISSING'
  | 'PATH_PARAM_UNBOUND'
  | 'BODY_ON_GET'
  | 'STATE_KEY_COLLISION'
  | 'SECRET_REF_EMPTY';

export interface ApiValidationError {
  code: ApiValidationCode;
  message: string;
  requestId?: string;
}

export interface ApiValidationResult {
  valid: boolean;
  errors: ApiValidationError[];
}

const PATH_TOKEN_PATTERN = /\{([^}]+)\}/g;

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

  return { valid: errors.length === 0, errors };
};
