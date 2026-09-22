import { HttpMethod } from '@mapples/types';

/** Auth a transport applies to the outgoing request. */
export interface TransportAuth {
  kind: 'bearer' | 'header';
  /** Header name for `kind: 'header'` (defaults to `Authorization`). */
  header?: string;
  /** Name of the secret; the transport owns the lookup. */
  secretRef: string;
}

/**
 * A resolved request as a transport receives it. `auth` still carries the
 * secret's *name*: whoever performs the call resolves it, so a transport that
 * forwards to a server never holds the secret's value.
 */
export interface TransportRequest {
  requestId: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  auth?: TransportAuth;
}

export interface TransportResponse {
  status: number;
  /** Whether the status is in the 2xx range. */
  ok: boolean;
  headers: Record<string, string>;
  /** The parsed body; `null` when the response declares no JSON. */
  data: unknown;
}

/**
 * Performs one request. A rejection is a failed request (network, CORS, an
 * unconfigured secret, an unparsable JSON body) — an HTTP error status is
 * not: it resolves with `ok: false`.
 */
export type RequestTransport = (
  request: TransportRequest,
) => Promise<TransportResponse>;

/**
 * The default transport: a direct `fetch`, with `auth` resolved against the
 * host-supplied `secrets`. A request whose secret is not configured throws
 * rather than going out unauthenticated.
 */
export const createFetchTransport =
  (secrets?: Record<string, string>): RequestTransport =>
  async (request) => {
    const headers = { ...request.headers };

    if (request.auth) {
      const secret = secrets?.[request.auth.secretRef];
      if (secret === undefined) {
        throw new Error(`Secret "${request.auth.secretRef}" is not configured`);
      }
      if (request.auth.kind === 'bearer') {
        headers.Authorization = `Bearer ${secret}`;
      } else {
        headers[request.auth.header ?? 'Authorization'] = secret;
      }
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers,
      body:
        request.body !== undefined ? JSON.stringify(request.body) : undefined,
    });

    // Only bodies that declare JSON are parsed. A body that claims JSON and
    // fails to parse is a broken server contract, so the parse error is left
    // to reject instead of quietly becoming `null` data.
    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('json') ? await response.json() : null;

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      ok: response.ok,
      headers: responseHeaders,
      data,
    };
  };
