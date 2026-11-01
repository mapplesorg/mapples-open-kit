/**
 * @fileoverview The project variables document: typed, writable app/page
 * state declarations, editable in the Creator and seeded into the writable
 * state store (`@mapples/state`) at runtime.
 *
 * Persisted as one opaque row per project (mirroring the api document);
 * validated client-side by `validateVariablesDocument`. Values are exposed
 * to bindings under the `vars.` namespace regardless of scope — scope
 * governs lifecycle (when a value resets), not addressing, so promoting a
 * page variable to app scope never breaks a binding.
 */

/** Runtime type of a declared variable's value. */
export type VariableValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array';

/** Where a variable lives and when it resets. */
export type VariableScope =
  /** Lives for the app session (optionally persisted). */
  | { kind: 'app' }
  /** Reset to `initialValue` whenever the page unmounts. */
  | { kind: 'page'; pageUuid: string };

/** A variable's `name` must match this to compose into binding dot-paths. */
export const VARIABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** The namespace prefix variables resolve under in bindings/conditions. */
export const VARIABLES_NAMESPACE = 'vars';

/**
 * The `mapples:setState` ops that make sense for each variable type. The
 * state handler coerces anything else (a toggled string becomes `false`, an
 * incremented one `NaN`), so authoring surfaces only offer these.
 */
export const VARIABLE_OPS_BY_TYPE: Record<
  VariableValueType,
  ReadonlySet<string>
> = {
  string: new Set(['set', 'clear']),
  number: new Set(['set', 'increment', 'decrement', 'clear']),
  boolean: new Set(['set', 'toggle', 'clear']),
  object: new Set(['set', 'clear']),
  array: new Set(['set', 'append', 'remove', 'toggleItem', 'clear']),
};

export interface VariableDefinition {
  /** Stable uuid — survives renames. */
  id: string;
  /** Binding segment under `vars.`; must match {@link VARIABLE_NAME_PATTERN}. */
  name: string;
  type: VariableValueType;
  scope: VariableScope;
  /** Seed value; must conform to `type` (validator-enforced). */
  initialValue: string | number | boolean | object | unknown[] | null;
  description?: string;
  /** App-scope only: persist across sessions via the host storage adapter. */
  persist?: boolean;
}

export interface VariablesDocument {
  version: 1;
  /** Keyed by {@link VariableDefinition.id}. */
  variables: Record<string, VariableDefinition>;
}

/** An empty document, used before a project has saved any variables. */
export const emptyVariablesDocument = (): VariablesDocument => ({
  version: 1,
  variables: {},
});

/** The state path a variable's value is bound at, e.g. `vars.count`. */
export const variableStatePath = (variable: VariableDefinition): string =>
  `${VARIABLES_NAMESPACE}.${variable.name}`;
