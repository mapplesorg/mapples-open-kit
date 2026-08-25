import {
  VARIABLE_NAME_PATTERN,
  VariableDefinition,
  VariablesDocument,
} from './variables';

/**
 * Codes for the invariants enforced by {@link validateVariablesDocument}.
 *
 * - `NAME_INVALID` — a name does not match {@link VARIABLE_NAME_PATTERN}.
 * - `NAME_DUPLICATE` — an app-scoped name is reused anywhere, or a
 *   page-scoped name is reused within the same page.
 * - `INITIAL_VALUE_MISMATCH` — `initialValue` does not conform to `type`.
 * - `PERSIST_ON_PAGE_SCOPE` — `persist` is set on a page-scoped variable.
 */
export type VariablesValidationCode =
  | 'NAME_INVALID'
  | 'NAME_DUPLICATE'
  | 'INITIAL_VALUE_MISMATCH'
  | 'PERSIST_ON_PAGE_SCOPE';

export interface VariablesValidationError {
  code: VariablesValidationCode;
  message: string;
  variableId?: string;
}

export interface VariablesValidationResult {
  valid: boolean;
  errors: VariablesValidationError[];
}

const conformsToType = (variable: VariableDefinition): boolean => {
  const { type, initialValue } = variable;
  if (initialValue === null) return true;
  switch (type) {
    case 'string':
      return typeof initialValue === 'string';
    case 'number':
      return typeof initialValue === 'number' && !Number.isNaN(initialValue);
    case 'boolean':
      return typeof initialValue === 'boolean';
    case 'array':
      return Array.isArray(initialValue);
    case 'object':
      return typeof initialValue === 'object' && !Array.isArray(initialValue);
  }
};

/**
 * Validate the structural invariants of a {@link VariablesDocument}. Collects
 * every violation (same shape as `validateApiDocument`).
 *
 * Name uniqueness: app-scoped names are unique project-wide (across both
 * scopes — a page variable may not shadow an app variable, since both
 * resolve under the flat `vars.` namespace); page-scoped names are unique
 * within their page.
 */
export const validateVariablesDocument = (
  document: VariablesDocument,
): VariablesValidationResult => {
  const errors: VariablesValidationError[] = [];
  const variables = Object.values(document.variables);

  const appNames = new Set<string>();
  for (const variable of variables) {
    if (variable.scope.kind === 'app') appNames.add(variable.name);
  }

  /** `<name>` for app clashes, `<pageUuid>/<name>` for page clashes. */
  const namesSeen = new Set<string>();

  for (const variable of variables) {
    if (!VARIABLE_NAME_PATTERN.test(variable.name)) {
      errors.push({
        code: 'NAME_INVALID',
        message: `Variable name "${variable.name}" must match ${VARIABLE_NAME_PATTERN}`,
        variableId: variable.id,
      });
    }

    const scopedKey =
      variable.scope.kind === 'page'
        ? `${variable.scope.pageUuid}/${variable.name}`
        : variable.name;
    const shadowsApp =
      variable.scope.kind === 'page' && appNames.has(variable.name);
    if (namesSeen.has(scopedKey) || shadowsApp) {
      errors.push({
        code: 'NAME_DUPLICATE',
        message: shadowsApp
          ? `Page variable "${variable.name}" collides with an app variable of the same name`
          : `Variable name "${variable.name}" is used more than once in its scope`,
        variableId: variable.id,
      });
    } else {
      namesSeen.add(scopedKey);
    }

    if (!conformsToType(variable)) {
      errors.push({
        code: 'INITIAL_VALUE_MISMATCH',
        message: `Variable "${variable.name}" initialValue does not conform to type "${variable.type}"`,
        variableId: variable.id,
      });
    }

    if (variable.persist && variable.scope.kind === 'page') {
      errors.push({
        code: 'PERSIST_ON_PAGE_SCOPE',
        message: `Variable "${variable.name}" is page-scoped and cannot be persisted`,
        variableId: variable.id,
      });
    }
  }

  return { valid: errors.length === 0, errors };
};
