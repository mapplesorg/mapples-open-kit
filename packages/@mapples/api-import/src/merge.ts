/**
 * @fileoverview Folds an import into a project API document — the one rule
 * the Creator's import dialog and the `mapples api import` command share.
 */
import type { ApiDocument } from '@mapples/types';

import { uniqueName } from './names.js';
import type { ApiImportResult } from './types.js';

export interface MergeApiImportOptions {
  /** Mints request and environment ids (the caller's uuid source). */
  mintId: () => string;
  /**
   * A request named like an existing one: `rename` adds it next to it
   * (`users2`, the Creator dialog's behaviour); `replace` updates the
   * existing request in place, keeping its id — re-running an import is then
   * idempotent and bindings to it keep working.
   */
  onConflict: 'rename' | 'replace';
  /**
   * The environment the import belongs to, by name (`--environment`). An
   * existing one takes the import's base URL and variables and the paths
   * stay relative to it; a new one is added for the base URL. Without it the
   * paths are relative only when the active environment already serves the
   * base URL.
   */
  environment?: string;
}

export interface MergeApiImportResult {
  document: ApiDocument;
  /** The ids of the imported requests, in import order. */
  requestIds: string[];
  /** The environment the requests' relative paths hang off, when one is used. */
  environmentId: string | null;
  /** What the merge did that the author should know: paths made absolute, an environment retargeted. */
  notes: string[];
}

/**
 * Returns a new document with `batch` folded in; `document` is not touched.
 * An empty document gets an environment from the import's base URL. When
 * the active environment already points at that base URL the paths stay
 * relative to it; otherwise they are made absolute, so an import never
 * silently retargets requests already in the project — unless the import
 * names its environment, which then exists (added, or updated to the base
 * URL) and keeps the paths relative, so `EXPO_PUBLIC_MAPPLES_API_ENVIRONMENT`
 * can switch between it and the others.
 */
export const mergeApiImport = (
  document: ApiDocument,
  batch: Pick<
    ApiImportResult,
    'baseUrl' | 'environmentName' | 'requests' | 'variables'
  >,
  { mintId, onConflict, environment }: MergeApiImportOptions,
): MergeApiImportResult => {
  // A JSON document: a JSON copy (structuredClone is not on every RN engine).
  const doc = JSON.parse(JSON.stringify(document)) as ApiDocument;
  const baseUrl = batch.baseUrl.replace(/\/$/, '');
  const notes: string[] = [];
  let environmentId = doc.activeEnvironmentId ?? null;
  let active = environmentId ? doc.environments[environmentId] : undefined;

  const named = environment
    ? Object.values(doc.environments).find(
        (candidate) => candidate.name === environment,
      )
    : undefined;
  if (environment && named) {
    environmentId = named.id;
    active = named;
    if (named.baseUrl.replace(/\/$/, '') !== baseUrl) {
      notes.push(
        `environment "${named.name}" now points at ${baseUrl} (was ${named.baseUrl})`,
      );
      named.baseUrl = baseUrl;
    }
  }

  let relative = active?.baseUrl.replace(/\/$/, '') === baseUrl;
  if (Object.keys(doc.environments).length === 0 || (environment && !named)) {
    const first = Object.keys(doc.environments).length === 0;
    environmentId = mintId();
    active = {
      id: environmentId,
      name: environment ?? batch.environmentName,
      baseUrl,
      ...(batch.variables ? { variables: { ...batch.variables } } : {}),
    };
    doc.environments[environmentId] = active;
    if (first) doc.activeEnvironmentId = environmentId;
    else {
      notes.push(
        `environment "${active.name}" added; "${doc.environments[doc.activeEnvironmentId ?? '']?.name ?? '?'}" stays active`,
      );
    }
    relative = true;
  } else if (relative && active && batch.variables) {
    // Values already set in the project win over the import's.
    active.variables = { ...batch.variables, ...active.variables };
  }
  if (!relative) {
    notes.push(
      `${baseUrl} is not the active environment's base URL, so the paths are written absolute — pass an environment name to add it as one and keep them relative`,
    );
  }

  const byName = new Map(
    Object.values(doc.requests).map((request) => [request.name, request]),
  );
  const taken = new Set(byName.keys());
  const requestIds: string[] = [];
  for (const request of batch.requests) {
    const isAbsolute = /^https?:\/\//i.test(request.path);
    const path =
      relative || isAbsolute
        ? request.path
        : `${baseUrl}${request.path.startsWith('/') ? '' : '/'}${request.path}`;
    const existing = byName.get(request.name);
    if (existing && onConflict === 'replace') {
      doc.requests[existing.id] = {
        ...request,
        id: existing.id,
        name: existing.name,
        path,
        // What the project chose or captured for this request stays its own:
        // its state key, the headers it reads from the app's state (a
        // signed-in user's token) and its saved data states.
        ...(existing.stateKey ? { stateKey: existing.stateKey } : {}),
        ...(existing.headerValues
          ? { headerValues: existing.headerValues }
          : {}),
        ...(existing.states ? { states: existing.states } : {}),
        responseSample: request.responseSample ?? existing.responseSample,
      };
      requestIds.push(existing.id);
      continue;
    }
    const id = mintId();
    doc.requests[id] = {
      ...request,
      id,
      name: uniqueName(request.name, taken),
      path,
    };
    requestIds.push(id);
  }
  return {
    document: doc,
    requestIds,
    environmentId: relative ? environmentId : null,
    notes,
  };
};
