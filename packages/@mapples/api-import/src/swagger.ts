/**
 * @fileoverview Swagger 2.0 → the OpenAPI 3 shape `importOpenApi` reads.
 * Only what the importer uses is translated: the server URL, `$ref` roots,
 * parameters (a `body` parameter becomes the request body), JSON responses
 * and the security schemes. PostgREST (Supabase, Neon's Data API) serves
 * this format, with most parameters shared under `#/parameters`.
 */

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

/** `#/definitions/x` → `#/components/schemas/x`, and so on, everywhere. */
const rewriteRefs = (node: unknown): unknown => {
  if (Array.isArray(node)) return node.map(rewriteRefs);
  if (!isObject(node)) return node;
  const out: Json = {};
  for (const [key, value] of Object.entries(node)) {
    out[key] =
      key === '$ref' && typeof value === 'string'
        ? value
            .replace(/^#\/definitions\//, '#/components/schemas/')
            .replace(/^#\/parameters\//, '#/components/parameters/')
            .replace(/^#\/responses\//, '#/components/responses/')
        : rewriteRefs(value);
  }
  return out;
};

/** A Swagger 2 non-body parameter: its type fields move under `schema`. */
const parameter3 = (parameter: Json): Json => {
  if (parameter.in === 'body' || isObject(parameter.schema)) return parameter;
  const {
    type,
    format,
    items,
    enum: values,
    default: fallback,
    ...rest
  } = parameter;
  const schema: Json = {};
  if (type !== undefined) schema.type = type;
  if (format !== undefined) schema.format = format;
  if (items !== undefined) schema.items = items;
  if (values !== undefined) schema.enum = values;
  if (fallback !== undefined) schema.default = fallback;
  return { ...rest, schema };
};

/** A Swagger 2 response: `schema` / `examples` move under `content`. */
const response3 = (response: unknown): unknown => {
  if (!isObject(response) || typeof response.$ref === 'string') return response;
  const { schema, examples, ...rest } = response;
  if (schema === undefined) return rest;
  const media: Json = { schema };
  if (isObject(examples) && 'application/json' in examples) {
    media.example = examples['application/json'];
  }
  return { ...rest, content: { 'application/json': media } };
};

const serverUrl = (document: Json, override?: string): string => {
  if (override) return override.replace(/\/$/, '');
  if (typeof document.host !== 'string') {
    throw new Error(
      'The Swagger document has no host — the requests would have no base URL',
    );
  }
  const schemes = Array.isArray(document.schemes) ? document.schemes : [];
  const scheme = schemes.includes('https') ? 'https' : (schemes[0] ?? 'https');
  const basePath =
    typeof document.basePath === 'string' ? document.basePath : '';
  // `:443` adds nothing to an https URL and only clutters the environment.
  const host = document.host.replace(/:443$/, '');
  return `${String(scheme)}://${host}${basePath}`.replace(/\/$/, '');
};

/**
 * Translates a parsed Swagger 2.0 document. `resolveParameter` reads a
 * shared parameter, so a `$ref`'d body parameter still becomes a body.
 * `baseUrl` replaces `host` + `basePath` (a spec served behind a proxy
 * often names the wrong host, or none).
 */
export const swaggerToOpenApi = (swagger: Json, baseUrl?: string): Json => {
  const document = rewriteRefs(swagger) as Json;
  const sharedParameters = isObject(document.parameters)
    ? document.parameters
    : {};
  const resolveParameter = (node: unknown): Json | null => {
    if (!isObject(node)) return null;
    if (typeof node.$ref === 'string') {
      const name = node.$ref.replace(/^#\/components\/parameters\//, '');
      const target = sharedParameters[name];
      return isObject(target) ? target : null;
    }
    return node;
  };

  const paths: Json = {};
  for (const [path, pathNode] of Object.entries(
    isObject(document.paths) ? document.paths : {},
  )) {
    if (!isObject(pathNode)) continue;
    const pathItem: Json = { ...pathNode };
    for (const method of METHODS) {
      const operation = pathNode[method];
      if (!isObject(operation)) continue;
      const parameters: unknown[] = [];
      let requestBody: Json | undefined;
      for (const node of Array.isArray(operation.parameters)
        ? operation.parameters
        : []) {
        const parameter = resolveParameter(node);
        if (parameter?.in === 'body') {
          requestBody = {
            content: { 'application/json': { schema: parameter.schema } },
          };
          continue;
        }
        // formData has no JSON-body equivalent; the importer skips it anyway.
        if (parameter?.in === 'formData') continue;
        parameters.push(
          isObject(node) && typeof node.$ref === 'string'
            ? node
            : parameter && parameter3(parameter),
        );
      }
      const responses = isObject(operation.responses)
        ? Object.fromEntries(
            Object.entries(operation.responses).map(([code, response]) => [
              code,
              response3(response),
            ]),
          )
        : {};
      pathItem[method] = {
        ...operation,
        parameters,
        ...(requestBody ? { requestBody } : {}),
        responses,
      };
    }
    paths[path] = pathItem;
  }

  const securitySchemes: Json = {};
  for (const [name, scheme] of Object.entries(
    isObject(document.securityDefinitions) ? document.securityDefinitions : {},
  )) {
    if (!isObject(scheme)) continue;
    // Swagger 2 has no bearer type: an `Authorization` API key is one.
    securitySchemes[name] =
      scheme.type === 'apiKey' &&
      scheme.in === 'header' &&
      typeof scheme.name === 'string' &&
      scheme.name.toLowerCase() === 'authorization'
        ? { type: 'http', scheme: 'bearer' }
        : scheme;
  }

  return {
    openapi: '3.0.0',
    info: document.info,
    servers: [{ url: serverUrl(document, baseUrl) }],
    paths,
    security: document.security,
    components: {
      schemas: document.definitions,
      parameters: Object.fromEntries(
        Object.entries(sharedParameters).map(([name, parameter]) => [
          name,
          isObject(parameter) ? parameter3(parameter) : parameter,
        ]),
      ),
      responses: isObject(document.responses)
        ? Object.fromEntries(
            Object.entries(document.responses).map(([name, response]) => [
              name,
              response3(response),
            ]),
          )
        : undefined,
      securitySchemes,
    },
  };
};
