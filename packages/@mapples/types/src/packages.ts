/**
 * @fileoverview The project packages document: which optional runtime
 * packages a project ships with.
 *
 * Persisted as one opaque row per project (mirroring the variables document).
 * Two fields, two owners:
 *
 * - `enabled` is user intent — optional packages the user switched on in the
 *   Creator's Project settings → Packages beyond what the canvas already uses.
 * - `resolved` is the effective install list. The Creator recomputes it
 *   (required baseline ∪ packages used by canvas elements ∪ `enabled`) on every
 *   toggle and after every successful push, and the `mapples` CLI reads it
 *   verbatim to add/remove dependencies and Expo config plugins.
 */

/** Why a package is part of the effective install list. */
export type PackageReason = 'required' | 'used' | 'enabled';

export interface PackageDependencyEntry {
  /** npm package name to install. */
  name: string;
  /** Semver range to install. */
  version: string;
}

export interface ResolvedPackageEntry {
  /** Catalog id, e.g. `qrcode` or `icon-pack:feather`. */
  id: string;
  reason: PackageReason;
  /** npm dependencies to install for this package. */
  dependencies: PackageDependencyEntry[];
  /** Expo config plugins to register in `app.json`, when the package has any. */
  expoPlugins?: string[];
}

export interface PackagesDocument {
  version: 1;
  /** Catalog ids the user enabled by hand (Creator-owned). */
  enabled: string[];
  /** Effective install list, written by the Creator, read by the CLI. */
  resolved: ResolvedPackageEntry[];
}

/** An empty document, used before a project has saved any package choice. */
export const emptyPackagesDocument = (): PackagesDocument => ({
  version: 1,
  enabled: [],
  resolved: [],
});
