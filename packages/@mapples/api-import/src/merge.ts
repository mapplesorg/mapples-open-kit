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
}

export interface MergeApiImportResult {
  document: ApiDocument;
  /** The ids of the imported requests, in import order. */
  requestIds: string[];
  /** The environment the requests' relative paths hang off, when one is used. */
  environmentId: string | null;
}

/**
 * Returns a new document with `batch` folded in; `document` is not touched.
 * An empty document gets an environment from the import's base URL. When
 * the active environment already points at that base URL the paths stay
 * relative to it; otherwise they are made absolute, so an import never
 * silently retargets requests already in the project.
 */
export const mergeApiImport = (
  document: ApiDocument,
  batch: Pick<
    ApiImportResult,
    'baseUrl' | 'environmentName' | 'requests' | 'variables'
  >,
  { mintId, onConflict }: MergeApiImportOptions,
): MergeApiImportResult => {
  // A JSON document: a JSON copy (structuredClone is not on every RN engine).
  const doc = JSON.parse(JSON.stringify(document)) as ApiDocument;
  const baseUrl = batch.baseUrl.replace(/\/$/, '');
  let environmentId = doc.activeEnvironmentId ?? null;
  const active = environmentId ? doc.environments[environmentId] : undefined;

  let relative = active?.baseUrl.replace(/\/$/, '') === baseUrl;
  if (Object.keys(doc.environments).length === 0) {
    environmentId = mintId();
    doc.environments[environmentId] = {
      id: environmentId,
      name: batch.environmentName,
      baseUrl,
      ...(batch.variables ? { variables: { ...batch.variables } } : {}),
    };
    doc.activeEnvironmentId = environmentId;
    relative = true;
  } else if (relative && active && batch.variables) {
    // Values already set in the project win over the import's.
    active.variables = { ...batch.variables, ...active.variables };
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
        // What the project chose or captured for this request stays its own.
        ...(existing.stateKey ? { stateKey: existing.stateKey } : {}),
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
  };
};
