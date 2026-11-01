import type { ApiValueSource } from '@mapples/types';

import type { BodyCredential } from './types.js';

/**
 * Body field names whose value is a credential. Matched on the whole key,
 * case-insensitively, `-`/`_` optional — `password`, `client_secret`,
 * `refresh-token`, `apiKey`. A plain `email` or `username` is an identifier,
 * not a credential, so it stays.
 */
const CREDENTIAL_KEY =
  /^(pass(word|wd)?|secret|client_?secret|api_?key|access_?token|refresh_?token|id_?token|token|private_?key|otp|pin)$/;

const normalizeKey = (key: string): string =>
  key.toLowerCase().replace(/-/g, '_');

const isCredentialKey = (key: string): boolean =>
  CREDENTIAL_KEY.test(normalizeKey(key));

/**
 * The state variable a stripped field reads from at runtime: `vars.<key>`
 * with the key made a valid variable name.
 */
const variablePath = (key: string): string =>
  `vars.${key.replace(/[^A-Za-z0-9_]/g, '_')}`;

/**
 * Finds credential-like string fields in a JSON body and replaces each value
 * with a `state` source (`vars.<field>`): a password or token pasted with a
 * cURL command must not land verbatim in the project document, and a sign-in
 * request reads it from the form at runtime anyway. Returns the rewritten
 * template and what was taken out — the values, so the import dialog can put
 * them back when the author explicitly asks to keep them.
 */
export const stripBodyCredentials = (
  template: unknown,
  requestIndex: number,
): { template: unknown; credentials: BodyCredential[] } => {
  const credentials: BodyCredential[] = [];

  const visit = (node: unknown, path: string[]): unknown => {
    if (Array.isArray(node)) {
      return node.map((item, index) => visit(item, [...path, String(index)]));
    }
    if (node === null || typeof node !== 'object') return node;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string' && value !== '' && isCredentialKey(key)) {
        const source: ApiValueSource = {
          kind: 'state',
          dataProp: variablePath(key),
        };
        credentials.push({
          requestIndex,
          path: [...path, key],
          value,
          replacement: source,
        });
        out[key] = source;
      } else {
        out[key] = visit(value, [...path, key]);
      }
    }
    return out;
  };

  return { template: visit(template, []), credentials };
};

/**
 * Puts a stripped credential back at its path in a body template — only on
 * the author's explicit choice in the import preview.
 */
export const restoreBodyCredential = (
  template: unknown,
  credential: BodyCredential,
): unknown => {
  const [head, ...rest] = credential.path;
  if (head === undefined) return credential.value;
  if (Array.isArray(template)) {
    const index = Number(head);
    return template.map((item, i) =>
      i === index
        ? restoreBodyCredential(item, { ...credential, path: rest })
        : item,
    );
  }
  if (template === null || typeof template !== 'object') {
    throw new Error(
      `The body has no field at "${credential.path.join('.')}" to restore`,
    );
  }
  const node = template as Record<string, unknown>;
  return {
    ...node,
    [head]: restoreBodyCredential(node[head], { ...credential, path: rest }),
  };
};
