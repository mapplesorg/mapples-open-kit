import type {
  ApiRequestAuth,
  ApiValueSource,
  HttpMethod,
} from '@mapples/types';
import { parse as parseYaml } from 'yaml';

import { nameFromRoute, toRequestName, uniqueName } from './names.js';
import { swaggerToOpenApi } from './swagger.js';
import type { ApiImportResult, ImportedRequest } from './types.js';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/** How deep a schema is followed when a sample is synthesized from it. */
const MAX_SCHEMA_DEPTH = 6;

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Whether the text is an OpenAPI 3 or Swagger 2 document (JSON or YAML). */
export const looksLikeOpenApi = (text: string): boolean =>
  /^\s*\{[\s\S]*"(openapi|swagger)"\s*:/.test(text) ||
  /^\s*(openapi|swagger)\s*:/m.test(text);

export interface OpenApiImportOptions {
  /**
   * The base URL the requests hang off, replacing the spec's own servers
   * (or Swagger `host` + `basePath`) — for a spec that names a different
   * host than the one the app calls, or none.
   */
  baseUrl?: string;
  /**
   * Where the document was fetched from: a relative server URL (`/api/v3`)
   * resolves against it. Without it a relative server URL throws.
   */
  sourceUrl?: string;
}

/** The parsed document, translated to the OpenAPI 3 shape when it is Swagger 2. */
const parseDocument = (
  text: string,
  options: OpenApiImportOptions,
): { document: Json; format: 'openapi' | 'swagger' } => {
  const trimmed = text.trim();
  const document: unknown = trimmed.startsWith('{')
    ? JSON.parse(trimmed)
    : parseYaml(trimmed);
  if (!isObject(document)) {
    throw new Error('The OpenAPI document is not an object');
  }
  if (typeof document.swagger === 'string') {
    if (!document.swagger.startsWith('2')) {
      throw new Error(`Swagger ${document.swagger} is not supported`);
    }
    return {
      document: swaggerToOpenApi(document, options.baseUrl),
      format: 'swagger',
    };
  }
  if (
    typeof document.openapi !== 'string' ||
    !document.openapi.startsWith('3')
  ) {
    throw new Error(
      'The document is not an OpenAPI 3.x or Swagger 2.0 definition',
    );
  }
  if (options.baseUrl) {
    return {
      document: { ...document, servers: [{ url: options.baseUrl }] },
      format: 'openapi',
    };
  }
  return { document, format: 'openapi' };
};

/** Follows a local `$ref`; a reference outside the document throws. */
const createResolver = (root: Json) => {
  const resolve = (node: unknown, seen: string[] = []): unknown => {
    if (!isObject(node) || typeof node.$ref !== 'string') return node;
    const ref = node.$ref;
    if (!ref.startsWith('#/')) {
      throw new Error(`External reference "${ref}" is not supported`);
    }
    if (seen.includes(ref)) {
      throw new Error(`Circular reference "${ref}"`);
    }
    let target: unknown = root;
    for (const segment of ref.slice(2).split('/')) {
      const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      if (!isObject(target) || !(key in target)) {
        throw new Error(`Reference "${ref}" does not resolve`);
      }
      target = target[key];
    }
    return resolve(target, [...seen, ref]);
  };
  return resolve;
};

type Resolve = ReturnType<typeof createResolver>;

/**
 * A sample value for a schema: its example or default when it has one,
 * otherwise a placeholder of the right type. A schema that refers back to
 * itself stops at `null` for that branch.
 */
const sampleFromSchema = (
  schemaNode: unknown,
  resolve: Resolve,
  depth = 0,
  refs: string[] = [],
): unknown => {
  let nextRefs = refs;
  if (isObject(schemaNode) && typeof schemaNode.$ref === 'string') {
    if (refs.includes(schemaNode.$ref)) return null;
    nextRefs = [...refs, schemaNode.$ref];
  }
  const schema = resolve(schemaNode);
  if (!isObject(schema) || depth > MAX_SCHEMA_DEPTH) return null;

  if ('example' in schema) return schema.example;
  if ('default' in schema) return schema.default;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0] as unknown;
  }

  if (Array.isArray(schema.allOf)) {
    return schema.allOf.reduce<Json>((merged, part) => {
      const sample = sampleFromSchema(part, resolve, depth + 1, nextRefs);
      return isObject(sample) ? { ...merged, ...sample } : merged;
    }, {});
  }
  const alternatives = schema.oneOf ?? schema.anyOf;
  if (Array.isArray(alternatives) && alternatives.length > 0) {
    return sampleFromSchema(alternatives[0], resolve, depth + 1, nextRefs);
  }

  const type = Array.isArray(schema.type)
    ? (schema.type as unknown[]).find((entry) => entry !== 'null')
    : schema.type;

  if (type === 'object' || isObject(schema.properties)) {
    const properties = isObject(schema.properties) ? schema.properties : {};
    return Object.fromEntries(
      Object.entries(properties).map(([key, property]) => [
        key,
        sampleFromSchema(property, resolve, depth + 1, nextRefs),
      ]),
    );
  }
  if (type === 'array') {
    return [sampleFromSchema(schema.items, resolve, depth + 1, nextRefs)];
  }
  if (type === 'integer' || type === 'number') return 0;
  if (type === 'boolean') return true;
  if (type === 'string') {
    if (schema.format === 'date-time') return '2025-01-01T00:00:00Z';
    if (schema.format === 'date') return '2025-01-01';
    if (schema.format === 'email') return 'user@example.com';
    if (schema.format === 'uuid') return '00000000-0000-0000-0000-000000000000';
    return 'string';
  }
  return null;
};

/** The JSON sample of a `content` map: its example, else its schema's. */
const sampleFromContent = (content: unknown, resolve: Resolve): unknown => {
  if (!isObject(content)) return undefined;
  const mediaType = Object.keys(content).find((key) => key.includes('json'));
  if (!mediaType) return undefined;
  const media = resolve(content[mediaType]);
  if (!isObject(media)) return undefined;

  if ('example' in media) return media.example;
  if (isObject(media.examples)) {
    const first = resolve(Object.values(media.examples)[0]);
    if (isObject(first) && 'value' in first) return first.value;
  }
  return media.schema === undefined
    ? undefined
    : sampleFromSchema(media.schema, resolve);
};

const parameterValue = (parameter: Json, resolve: Resolve): string => {
  const schema = resolve(parameter.schema);
  const example =
    parameter.example ??
    (isObject(schema) ? (schema.example ?? schema.default) : undefined);
  return example === undefined || example === null ? '' : String(example);
};

/**
 * Replaces each `{name}` (a non-empty run up to the next `}`) with
 * `replace(name)`, left to right like `/\{([^}]+)\}/g`, in linear time.
 */
const replaceBraced = (
  input: string,
  replace: (name: string) => string,
): string => {
  let out = '';
  let from = 0;
  for (
    let open = input.indexOf('{');
    open !== -1;
    open = input.indexOf('{', open + 1)
  ) {
    const close = input.indexOf('}', open + 1);
    if (close === -1) break;
    if (close === open + 1) continue;
    out += input.slice(from, open) + replace(input.slice(open + 1, close));
    from = close + 1;
    open = close;
  }
  return out + input.slice(from);
};

const serverUrl = (
  document: Json,
  resolve: Resolve,
  sourceUrl: string | undefined,
): string => {
  const servers = Array.isArray(document.servers) ? document.servers : [];
  const server = resolve(servers[0]);
  if (!isObject(server) || typeof server.url !== 'string') {
    throw new Error(
      'The OpenAPI document has no servers[0].url — the requests would have no base URL',
    );
  }
  const variables = isObject(server.variables) ? server.variables : {};
  let url = server.url;
  if (!/^https?:\/\//i.test(url)) {
    if (!sourceUrl) {
      throw new Error(
        `The server URL "${url}" is relative — pass the URL the document came from, or a base URL`,
      );
    }
    url = new URL(url, sourceUrl).toString();
  }
  return replaceBraced(url, (name) => {
    const variable = resolve(variables[name]);
    if (!isObject(variable) || variable.default === undefined) {
      throw new Error(`Server variable "${name}" has no default`);
    }
    return String(variable.default);
  }).replace(/\/$/, '');
};

/**
 * The first security requirement a request can carry: HTTP bearer, or an API
 * key in a header. Only the scheme's *name* is kept, as the secret to store.
 */
const authFor = (
  security: unknown,
  schemes: Json,
  resolve: Resolve,
): ApiRequestAuth | undefined => {
  if (!Array.isArray(security)) return undefined;
  for (const requirement of security) {
    if (!isObject(requirement)) continue;
    for (const schemeName of Object.keys(requirement)) {
      const scheme = resolve(schemes[schemeName]);
      if (!isObject(scheme)) continue;
      const secretRef = toRequestName(schemeName)
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toUpperCase();
      if (scheme.type === 'http' && scheme.scheme === 'bearer') {
        return { kind: 'bearer', secretRef };
      }
      if (
        scheme.type === 'apiKey' &&
        scheme.in === 'header' &&
        typeof scheme.name === 'string'
      ) {
        return { kind: 'header', header: scheme.name, secretRef };
      }
    }
  }
  return undefined;
};

/**
 * An OpenAPI 3.x (or Swagger 2.0) document → one request per operation. Path parameters and
 * required query parameters become `params` (with the spec's example as the
 * value), a JSON request body becomes the body template, and the first 2xx
 * JSON response becomes the response sample, synthesized from the schema
 * when the spec gives no example.
 */
export const importOpenApi = (
  text: string,
  options: OpenApiImportOptions = {},
): ApiImportResult => {
  const { document, format } = parseDocument(text, options);
  const resolve = createResolver(document);
  const warnings: string[] = [];

  const components = isObject(document.components) ? document.components : {};
  const schemes = isObject(components.securitySchemes)
    ? components.securitySchemes
    : {};

  const info = isObject(document.info) ? document.info : {};
  const paths = isObject(document.paths) ? document.paths : {};
  const taken = new Set<string>();
  const requests: ImportedRequest[] = [];

  for (const [path, pathNode] of Object.entries(paths)) {
    const pathItem = resolve(pathNode);
    if (!isObject(pathItem)) continue;
    const sharedParameters = Array.isArray(pathItem.parameters)
      ? pathItem.parameters
      : [];

    for (const method of METHODS) {
      const operation = pathItem[method];
      if (!isObject(operation)) continue;

      const params: Record<string, ApiValueSource> = {};
      const parameters = [
        ...sharedParameters,
        ...(Array.isArray(operation.parameters) ? operation.parameters : []),
      ];
      for (const parameterNode of parameters) {
        const parameter = resolve(parameterNode);
        if (!isObject(parameter) || typeof parameter.name !== 'string')
          continue;
        const wanted =
          parameter.in === 'path' ||
          (parameter.in === 'query' && parameter.required === true);
        if (!wanted) continue;
        params[parameter.name] = {
          kind: 'static',
          value: parameterValue(parameter, resolve),
        };
      }

      const requestBody = resolve(operation.requestBody);
      const template =
        method === 'get' || !isObject(requestBody)
          ? undefined
          : sampleFromContent(requestBody.content, resolve);

      const responses = isObject(operation.responses)
        ? operation.responses
        : {};
      const successCode =
        Object.keys(responses)
          .filter((code) => /^2\d\d$/.test(code))
          .sort()[0] ?? ('default' in responses ? 'default' : undefined);
      const response = successCode
        ? resolve(responses[successCode])
        : undefined;

      const security = operation.security ?? document.security;
      const auth = authFor(security, schemes, resolve);
      if (Array.isArray(security) && security.length > 0 && !auth) {
        warnings.push(
          `${method.toUpperCase()} ${path}: its security scheme is neither HTTP bearer nor a header API key — set its auth by hand.`,
        );
      }

      requests.push({
        name: uniqueName(
          typeof operation.operationId === 'string'
            ? toRequestName(operation.operationId)
            : nameFromRoute(method, path),
          taken,
        ),
        method: method.toUpperCase() as HttpMethod,
        path,
        params: Object.keys(params).length > 0 ? params : undefined,
        body: template === undefined ? undefined : { kind: 'json', template },
        auth,
        // A success that declares no body (a 204) samples as `null`: the
        // request has its state, and bindings read nothing from it.
        responseSample: isObject(response)
          ? isObject(response.content)
            ? sampleFromContent(response.content, resolve)
            : null
          : undefined,
      });
    }
  }

  if (requests.length === 0) {
    throw new Error('The OpenAPI document declares no operations');
  }

  return {
    format,
    baseUrl: serverUrl(document, resolve, options.sourceUrl),
    environmentName: typeof info.title === 'string' ? info.title : 'API',
    requests,
    warnings,
  };
};
