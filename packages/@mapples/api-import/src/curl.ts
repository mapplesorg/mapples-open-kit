import type {
  ApiRequestAuth,
  ApiValueSource,
  HttpMethod,
} from '@mapples/types';

import { stripBodyCredentials } from './bodyCredentials.js';
import { nameFromRoute } from './names.js';
import type { ApiImportResult, BodyCredential } from './types.js';

const METHODS: readonly string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/** Headers whose value is a credential: imported as auth, never as text. */
const API_KEY_HEADERS = ['x-api-key', 'api-key', 'apikey', 'x-auth-token'];

/** Flags that take a value we have no use for. */
const IGNORED_WITH_VALUE = new Set([
  '-A',
  '--user-agent',
  '-e',
  '--referer',
  '-b',
  '--cookie',
  '-o',
  '--output',
  '-m',
  '--max-time',
  '--connect-timeout',
  '-w',
  '--write-out',
  '--retry',
]);

/** Flags that change nothing about the request itself. */
const IGNORED = new Set([
  '--compressed',
  '-s',
  '--silent',
  '-S',
  '--show-error',
  '-k',
  '--insecure',
  '-L',
  '--location',
  '-i',
  '--include',
  '-v',
  '--verbose',
  '-g',
  '--globoff',
  '--http1.1',
  '--http2',
]);

const DATA_FLAGS = new Set([
  '-d',
  '--data',
  '--data-raw',
  '--data-binary',
  '--data-ascii',
  '--json',
]);

const ANSI_C_ESCAPES: Record<string, string> = {
  n: '\n',
  t: '\t',
  r: '\r',
  '\\': '\\',
  "'": "'",
  '"': '"',
};

/**
 * Splits a shell command line into words: single quotes (literal), double
 * quotes (backslash escapes `"`, `\`, `$` and the backtick), ANSI-C `$'…'`
 * (what Chrome's "Copy as cURL" emits for bodies), backslash escapes, and
 * backslash-newline continuations.
 */
export const tokenizeShell = (input: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let inToken = false;
  let index = 0;

  const fail = (what: string): never => {
    throw new Error(`The cURL command has an unterminated ${what}`);
  };

  while (index < input.length) {
    const char = input[index];

    if (char === '\\') {
      const next = input[index + 1];
      if (next === '\n') {
        index += 2;
        continue;
      }
      if (next === '\r' && input[index + 2] === '\n') {
        index += 3;
        continue;
      }
      if (next === undefined) fail('escape');
      current += next;
      inToken = true;
      index += 2;
      continue;
    }

    if (char === "'" || (char === '$' && input[index + 1] === "'")) {
      const ansi = char === '$';
      index += ansi ? 2 : 1;
      inToken = true;
      for (;;) {
        const inner = input[index];
        if (inner === undefined) fail('single quote');
        if (inner === "'") break;
        if (ansi && inner === '\\') {
          const escaped = input[index + 1];
          if (escaped === undefined) fail('escape');
          current += ANSI_C_ESCAPES[escaped] ?? `\\${escaped}`;
          index += 2;
          continue;
        }
        current += inner;
        index += 1;
      }
      index += 1;
      continue;
    }

    if (char === '"') {
      index += 1;
      inToken = true;
      for (;;) {
        const inner = input[index];
        if (inner === undefined) fail('double quote');
        if (inner === '"') break;
        if (inner === '\\' && '"\\$`'.includes(input[index + 1] ?? '')) {
          current += input[index + 1];
          index += 2;
          continue;
        }
        current += inner;
        index += 1;
      }
      index += 1;
      continue;
    }

    if (/\s/.test(char)) {
      if (inToken) tokens.push(current);
      current = '';
      inToken = false;
      index += 1;
      continue;
    }

    current += char;
    inToken = true;
    index += 1;
  }

  if (inToken) tokens.push(current);
  return tokens;
};

const staticSource = (value: string): ApiValueSource => ({
  kind: 'static',
  value,
});

/** Whether the text is a cURL command (leading `$` prompt tolerated). */
export const looksLikeCurl = (text: string): boolean =>
  /^\s*(\$\s+)?curl(\s|$)/.test(text);

/**
 * One cURL command → one request. Credentials in the command (a bearer token,
 * an API-key header, `-u`) become `auth` naming a secret; the value itself is
 * dropped and reported in `warnings`. Anything that would change what the
 * request sends and can't be represented (a form upload, a non-JSON body)
 * throws rather than importing a different request.
 */
export const importCurl = (text: string): ApiImportResult => {
  const tokens = tokenizeShell(text.trim().replace(/^\$\s+/, ''));
  if (tokens[0] !== 'curl') {
    throw new Error('The text is not a cURL command');
  }

  let method: string | undefined;
  let url: string | undefined;
  let asQuery = false;
  const data: string[] = [];
  const headers: Record<string, string> = {};
  const warnings: string[] = [];
  let auth: ApiRequestAuth | undefined;

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    const value = (): string => {
      index += 1;
      const next = tokens[index];
      if (next === undefined) {
        throw new Error(`cURL option "${token}" is missing its value`);
      }
      return next;
    };

    if (token === '-X' || token === '--request') {
      method = value().toUpperCase();
    } else if (token === '-H' || token === '--header') {
      const header = value();
      const colon = header.indexOf(':');
      if (colon === -1) throw new Error(`Header "${header}" has no ":"`);
      headers[header.slice(0, colon).trim()] = header.slice(colon + 1).trim();
    } else if (DATA_FLAGS.has(token)) {
      data.push(value());
      if (token === '--json') headers['Content-Type'] = 'application/json';
    } else if (token === '--url') {
      url = value();
    } else if (token === '-G' || token === '--get') {
      asQuery = true;
    } else if (token === '-u' || token === '--user') {
      value();
      auth = {
        kind: 'header',
        header: 'Authorization',
        secretRef: 'BASIC_AUTH',
      };
      warnings.push(
        'The -u credentials were not imported. Store "Basic <base64 user:password>" as the secret BASIC_AUTH.',
      );
    } else if (IGNORED_WITH_VALUE.has(token)) {
      value();
    } else if (IGNORED.has(token)) {
      // Transport details with no place in a request definition.
    } else if (token.startsWith('-')) {
      throw new Error(`cURL option "${token}" is not supported by the import`);
    } else if (url === undefined) {
      url = token;
    } else {
      throw new Error(`Unexpected argument "${token}" — one URL per command`);
    }
  }

  if (!url) throw new Error('The cURL command has no URL');
  const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);

  for (const [name, headerValue] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (lower === 'authorization') {
      const bearer = /^bearer\s+/i.test(headerValue);
      auth = bearer
        ? { kind: 'bearer', secretRef: 'API_TOKEN' }
        : { kind: 'header', header: name, secretRef: 'API_TOKEN' };
      warnings.push(
        bearer
          ? 'The bearer token was not imported. Store it as the secret API_TOKEN.'
          : 'The Authorization header value was not imported. Store it as the secret API_TOKEN.',
      );
      delete headers[name];
    } else if (API_KEY_HEADERS.includes(lower)) {
      auth = { kind: 'header', header: name, secretRef: 'API_KEY' };
      warnings.push(
        `The ${name} value was not imported. Store it as the secret API_KEY.`,
      );
      delete headers[name];
    } else if (lower === 'cookie') {
      warnings.push('The Cookie header was not imported.');
      delete headers[name];
    }
  }

  const params: Record<string, ApiValueSource> = {};
  parsed.searchParams.forEach((paramValue, key) => {
    params[key] = staticSource(paramValue);
  });

  let template: unknown;
  if (data.length > 0 && asQuery) {
    for (const pair of data.join('&').split('&')) {
      const [key, ...rest] = pair.split('=');
      params[decodeURIComponent(key)] = staticSource(
        decodeURIComponent(rest.join('=')),
      );
    }
  } else if (data.length > 0) {
    const raw = data.join('&');
    try {
      template = JSON.parse(raw) as unknown;
    } catch {
      throw new Error(
        'The cURL body is not JSON — only JSON bodies can be imported',
      );
    }
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  // A password or token in the body is a credential like a bearer header:
  // it reads from state instead. The preview lists each one (and lets the
  // author keep the literal on purpose).
  let bodyCredentials: BodyCredential[] = [];
  if (template !== undefined) {
    const stripped = stripBodyCredentials(template, 0);
    template = stripped.template;
    bodyCredentials = stripped.credentials;
  }

  const resolvedMethod = method ?? (template === undefined ? 'GET' : 'POST');
  if (!METHODS.includes(resolvedMethod)) {
    throw new Error(`HTTP method "${resolvedMethod}" is not supported`);
  }

  const path = decodeURI(parsed.pathname);
  return {
    format: 'curl',
    baseUrl: parsed.origin,
    environmentName: parsed.host,
    requests: [
      {
        name: nameFromRoute(resolvedMethod, path),
        method: resolvedMethod as HttpMethod,
        path,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        params: Object.keys(params).length > 0 ? params : undefined,
        body: template === undefined ? undefined : { kind: 'json', template },
        auth,
      },
    ],
    warnings,
    bodyCredentials: bodyCredentials.length > 0 ? bodyCredentials : undefined,
  };
};
