/**
 * @fileoverview A Postman collection (v2.0 / v2.1 JSON) → API requests.
 * Folders flatten into one list; `{{variables}}` stay as templates (the
 * Mapples runtime interpolates the same syntax from the environment), the
 * collection's variables become the environment's, and credentials are
 * never imported — only the secret names to store them under.
 */
import type {
  ApiRequestAuth,
  ApiValueSource,
  HttpMethod,
} from '@mapples/types';

import { stripBodyCredentials } from './bodyCredentials.js';
import { nameFromRoute, toRequestName, uniqueName } from './names.js';
import type {
  ApiImportResult,
  BodyCredential,
  ImportedRequest,
} from './types.js';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const METHODS = new Set<HttpMethod>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

/** Header and variable names whose values are credentials. */
const CREDENTIAL_NAME =
  /(token|secret|password|passwd|api[-_]?key|apikey|auth|bearer|session|cookie|private)/i;

/** A `{{name}}` that is the whole value. */
const WHOLE_VARIABLE = /^\{\{\s*([^}]+?)\s*\}\}$/;

/** `apiToken` / `api-token` → `API_TOKEN`, the shape secret names take. */
const secretName = (name: string): string =>
  toRequestName(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();

/** Whether the text is a Postman collection export. */
export const looksLikePostman = (text: string): boolean =>
  /^\s*\{[\s\S]*"info"[\s\S]*"schema"\s*:\s*"[^"]*getpostman\.com\/json\/collection/.test(
    text,
  );

interface FlatItem {
  name: string;
  request: Json;
  response: unknown[];
}

/** Every request in the collection, folders flattened depth-first. */
const flatten = (items: unknown[], out: FlatItem[] = []): FlatItem[] => {
  for (const item of items) {
    if (!isObject(item)) continue;
    if (Array.isArray(item.item)) {
      flatten(item.item, out);
      continue;
    }
    const request =
      typeof item.request === 'string'
        ? { url: item.request, method: 'GET' }
        : item.request;
    if (!isObject(request)) continue;
    out.push({
      name: typeof item.name === 'string' ? item.name : '',
      request,
      response: Array.isArray(item.response) ? item.response : [],
    });
  }
  return out;
};

const rawUrl = (url: unknown): string => {
  if (typeof url === 'string') return url;
  if (isObject(url) && typeof url.raw === 'string') return url.raw;
  throw new Error('A Postman request has no URL');
};

/** A collection/request `auth` block as a Mapples auth, plus the warning it costs. */
const authFrom = (
  auth: unknown,
  where: string,
  warnings: string[],
): ApiRequestAuth | undefined => {
  if (!isObject(auth) || auth.type === 'noauth') return undefined;
  const entries = Array.isArray(auth[auth.type as string])
    ? (auth[auth.type as string] as unknown[])
    : [];
  const field = (key: string): string | undefined => {
    const entry = entries.find(
      (candidate) => isObject(candidate) && candidate.key === key,
    );
    return isObject(entry) && typeof entry.value === 'string'
      ? entry.value
      : undefined;
  };
  const secretFor = (value: string | undefined, fallback: string): string => {
    const variable = value?.match(WHOLE_VARIABLE)?.[1];
    return secretName(variable ?? fallback);
  };
  if (auth.type === 'bearer') {
    const secretRef = secretFor(field('token'), 'API_TOKEN');
    warnings.push(
      `${where}: the bearer token was not imported. Store it as the secret ${secretRef}.`,
    );
    return { kind: 'bearer', secretRef };
  }
  if (auth.type === 'apikey' && field('in') !== 'query') {
    const header = field('key') ?? 'X-API-Key';
    const secretRef = secretFor(field('value'), 'API_KEY');
    warnings.push(
      `${where}: the ${header} value was not imported. Store it as the secret ${secretRef}.`,
    );
    return { kind: 'header', header, secretRef };
  }
  warnings.push(
    `${where}: Postman "${String(auth.type)}" auth is not supported — set the request's auth by hand.`,
  );
  return undefined;
};

/**
 * Splits a URL into the shared origin and the path. A leading
 * `{{baseUrl}}`-style variable is the origin (its value becomes the
 * environment's base URL); otherwise the scheme + host are.
 */
const splitUrl = (url: string): { origin: string; path: string } => {
  const variable = url.match(/^(\{\{\s*[^}]+?\s*\}\})(.*)$/);
  if (variable) return { origin: variable[1], path: variable[2] || '/' };
  const absolute = url.match(/^(https?:\/\/[^/?#]+)(.*)$/i);
  if (absolute) return { origin: absolute[1], path: absolute[2] || '/' };
  throw new Error(
    `"${url}" is neither absolute nor starts with a {{variable}}`,
  );
};

/**
 * A Postman collection → one request per item. The most common origin
 * becomes the environment's base URL (a `{{baseUrl}}` variable resolves to
 * its collection value); requests on another origin keep absolute URLs.
 * `:id` path segments become `{id}` tokens with the item's example values.
 */
export const importPostman = (text: string): ApiImportResult => {
  const collection: unknown = JSON.parse(text);
  if (!isObject(collection) || !Array.isArray(collection.item)) {
    throw new Error('The text is not a Postman collection');
  }
  const info = isObject(collection.info) ? collection.info : {};
  const warnings: string[] = [];

  const variables: Record<string, string> = {};
  for (const entry of Array.isArray(collection.variable)
    ? collection.variable
    : []) {
    if (!isObject(entry) || typeof entry.key !== 'string') continue;
    if (CREDENTIAL_NAME.test(entry.key)) {
      warnings.push(
        `The collection variable "${entry.key}" looks like a credential and was not imported. Store it as the secret ${secretName(entry.key)}.`,
      );
      continue;
    }
    variables[entry.key] = entry.value === undefined ? '' : String(entry.value);
  }

  const items = flatten(collection.item);
  if (items.length === 0) {
    throw new Error('The Postman collection holds no requests');
  }

  const origins = new Map<string, number>();
  const parsed = items.map((item) => {
    const split = splitUrl(rawUrl(item.request.url));
    origins.set(split.origin, (origins.get(split.origin) ?? 0) + 1);
    return { item, ...split };
  });
  const origin = [...origins.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const originVariable = origin.match(WHOLE_VARIABLE)?.[1];
  let baseUrl = origin;
  if (originVariable) {
    const value = variables[originVariable];
    if (!value) {
      throw new Error(
        `The requests start with {{${originVariable}}}, which the collection gives no value — export the collection with its variables`,
      );
    }
    baseUrl = value;
    delete variables[originVariable];
  }

  // Resolved once: requests without their own auth inherit it.
  const collectionAuth = authFrom(collection.auth, 'Collection', warnings);
  const taken = new Set<string>();
  const credentials: BodyCredential[] = [];
  const requests: ImportedRequest[] = parsed.map(
    ({ item, origin: itemOrigin, path: rawPath }, index) => {
      const method = String(item.request.method ?? 'GET').toUpperCase();
      if (!METHODS.has(method as HttpMethod)) {
        throw new Error(`"${item.name}": method ${method} is not supported`);
      }
      const where = `${method} ${item.name || rawPath}`;
      const url = isObject(item.request.url) ? item.request.url : {};

      // `:id` → `{id}`; the query string moves into params.
      const [pathPart, queryPart] = rawPath.split('?');
      const path = pathPart.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '{$1}');
      const params: Record<string, ApiValueSource> = {};
      for (const entry of Array.isArray(url.variable) ? url.variable : []) {
        if (isObject(entry) && typeof entry.key === 'string') {
          params[entry.key] = {
            kind: 'static',
            value: entry.value === undefined ? '' : String(entry.value),
          };
        }
      }
      // A URL given as a plain string carries its query only in the text.
      const query: unknown[] = Array.isArray(url.query)
        ? url.query
        : (queryPart ?? '')
            .split('&')
            .filter((pair) => pair !== '')
            .map((pair) => {
              const [key, ...value] = pair.split('=');
              return {
                key: decodeURIComponent(key),
                value: decodeURIComponent(value.join('=')),
              };
            });
      for (const entry of query) {
        if (!isObject(entry) || typeof entry.key !== 'string' || entry.disabled)
          continue;
        if (CREDENTIAL_NAME.test(entry.key)) {
          warnings.push(
            `${where}: the query parameter "${entry.key}" looks like a credential and was not imported.`,
          );
          continue;
        }
        params[entry.key] = {
          kind: 'static',
          value: entry.value == null ? '' : String(entry.value),
        };
      }

      const headers: Record<string, string> = {};
      for (const entry of Array.isArray(item.request.header)
        ? item.request.header
        : []) {
        if (!isObject(entry) || typeof entry.key !== 'string' || entry.disabled)
          continue;
        if (CREDENTIAL_NAME.test(entry.key)) {
          warnings.push(
            `${where}: the ${entry.key} header was not imported — it carries a credential; set the request's auth instead.`,
          );
          continue;
        }
        if (entry.key.toLowerCase() === 'content-type') continue;
        headers[entry.key] = String(entry.value ?? '');
      }

      let template: unknown;
      const body = isObject(item.request.body) ? item.request.body : null;
      if (body && body.mode === 'raw' && typeof body.raw === 'string') {
        const raw = body.raw.trim();
        if (raw !== '') {
          try {
            template = JSON.parse(raw);
          } catch {
            warnings.push(
              `${where}: the body is not plain JSON (Postman variables inside it?) — it was not imported.`,
            );
          }
        }
      } else if (body && body.mode && body.mode !== 'none') {
        warnings.push(
          `${where}: a ${String(body.mode)} body is not supported — only raw JSON bodies are imported.`,
        );
      }
      if (template !== undefined) {
        const stripped = stripBodyCredentials(template, index);
        template = stripped.template;
        credentials.push(...stripped.credentials);
      }

      let responseSample: unknown;
      for (const response of item.response) {
        if (!isObject(response) || typeof response.body !== 'string') continue;
        const code = Number(response.code);
        if (Number.isFinite(code) && (code < 200 || code >= 300)) continue;
        try {
          responseSample = JSON.parse(response.body);
          break;
        } catch {
          // A non-JSON saved response is no sample.
        }
      }

      return {
        name: uniqueName(
          item.name ? toRequestName(item.name) : nameFromRoute(method, path),
          taken,
        ),
        method: method as HttpMethod,
        path: itemOrigin === origin ? path : `${itemOrigin}${path}`,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        params: Object.keys(params).length > 0 ? params : undefined,
        body: template === undefined ? undefined : { kind: 'json', template },
        // The collection's credential is for its own API: a request to
        // another origin never inherits it.
        auth:
          item.request.auth !== undefined
            ? authFrom(item.request.auth, where, warnings)
            : itemOrigin === origin
              ? collectionAuth
              : undefined,
        responseSample,
      };
    },
  );

  return {
    format: 'postman',
    baseUrl: baseUrl.replace(/\/$/, ''),
    environmentName: typeof info.name === 'string' ? info.name : 'API',
    requests,
    variables: Object.keys(variables).length > 0 ? variables : undefined,
    warnings,
    bodyCredentials: credentials.length > 0 ? credentials : undefined,
  };
};
