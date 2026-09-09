import { PackageReason, PackagesDocument } from './packages';

/**
 * Codes for the invariants enforced by {@link validatePackagesDocument}.
 *
 * - `VERSION_UNSUPPORTED` — `version` is not `1`.
 * - `ENABLED_INVALID` — an `enabled` entry is not a non-empty string.
 * - `ENABLED_DUPLICATE` — an id appears in `enabled` more than once.
 * - `RESOLVED_INVALID` — a `resolved` entry is missing `id`, carries an
 *   unknown `reason`, or has a malformed `dependencies` list.
 * - `RESOLVED_DUPLICATE` — an id appears in `resolved` more than once.
 */
export type PackagesValidationCode =
  | 'VERSION_UNSUPPORTED'
  | 'ENABLED_INVALID'
  | 'ENABLED_DUPLICATE'
  | 'RESOLVED_INVALID'
  | 'RESOLVED_DUPLICATE';

export interface PackagesValidationError {
  code: PackagesValidationCode;
  message: string;
  packageId?: string;
}

export interface PackagesValidationResult {
  valid: boolean;
  errors: PackagesValidationError[];
}

const REASONS: readonly PackageReason[] = ['required', 'used', 'enabled'];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isDependencyList = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (dependency) =>
      dependency &&
      isNonEmptyString(dependency.name) &&
      isNonEmptyString(dependency.version),
  );

/**
 * Validate the structural invariants of a {@link PackagesDocument}. Collects
 * every violation (same shape as `validateVariablesDocument`).
 */
export const validatePackagesDocument = (
  document: PackagesDocument,
): PackagesValidationResult => {
  const errors: PackagesValidationError[] = [];

  if (document.version !== 1) {
    errors.push({
      code: 'VERSION_UNSUPPORTED',
      message: `Packages document version ${String(document.version)} is not supported`,
    });
  }

  const enabledSeen = new Set<string>();
  for (const id of Array.isArray(document.enabled) ? document.enabled : []) {
    if (!isNonEmptyString(id)) {
      errors.push({
        code: 'ENABLED_INVALID',
        message: 'Enabled package ids must be non-empty strings',
      });
      continue;
    }
    if (enabledSeen.has(id)) {
      errors.push({
        code: 'ENABLED_DUPLICATE',
        message: `Package "${id}" is enabled more than once`,
        packageId: id,
      });
    } else {
      enabledSeen.add(id);
    }
  }
  if (!Array.isArray(document.enabled)) {
    errors.push({
      code: 'ENABLED_INVALID',
      message: '`enabled` must be an array of package ids',
    });
  }

  const resolvedSeen = new Set<string>();
  for (const entry of Array.isArray(document.resolved)
    ? document.resolved
    : []) {
    if (
      !entry ||
      !isNonEmptyString(entry.id) ||
      !REASONS.includes(entry.reason) ||
      !isDependencyList(entry.dependencies) ||
      (entry.expoPlugins !== undefined &&
        !(
          Array.isArray(entry.expoPlugins) &&
          entry.expoPlugins.every(isNonEmptyString)
        ))
    ) {
      errors.push({
        code: 'RESOLVED_INVALID',
        message:
          'Resolved entries need `id`, a known `reason` and a `dependencies` list of { name, version }',
        packageId: entry?.id,
      });
      continue;
    }
    if (resolvedSeen.has(entry.id)) {
      errors.push({
        code: 'RESOLVED_DUPLICATE',
        message: `Package "${entry.id}" is resolved more than once`,
        packageId: entry.id,
      });
    } else {
      resolvedSeen.add(entry.id);
    }
  }
  if (!Array.isArray(document.resolved)) {
    errors.push({
      code: 'RESOLVED_INVALID',
      message: '`resolved` must be an array of resolved package entries',
    });
  }

  return { valid: errors.length === 0, errors };
};
