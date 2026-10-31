import { isValueSource, resolveValueSource } from '@mapples/state';
import {
  Action,
  ApiDocument,
  ApiRequest,
  ApiValueSource,
  apiRequestStateKey,
  HttpMethod,
} from '@mapples/types';
import { isPlainObject } from 'lodash';

import { RequestActionType } from './constants';
import { TransportAuth, TransportRequest } from './transport';

/** A follow-up action re-emitted after the request settles. */
export interface FollowUpAction {
  type: string;
  data?: unknown;
  /** Literal payload merged over `data`, as on an element's action. */
  staticData?: Record<string, unknown>;
}

/** A fully-resolved request, ready to execute. */
export interface RequestCommand {
  requestId: string;
  stateKey: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  /** Left unresolved: the transport that performs the call owns the secret. */
  auth?: TransportAuth;
  responseSample?: unknown;
  onSuccess?: FollowUpAction;
  onError?: FollowUpAction;
}

/** Everything value resolution may need at emit time. */
export interface RequestResolutionContext {
  /** Resolves `state`-kind value sources (a `@mapples/state` lookup). */
  getStateValue?: (path: string) => unknown;
  /**
   * Sample execution never performs the call, so the url is left as the
   * request's unresolved path: a preview must not fail on a value that only
   * exists at runtime (a path token bound to a list row, say).
   */
  sample?: boolean;
}

const resolveSource = (
  source: ApiValueSource,
  action: Action,
  context: RequestResolutionContext,
): unknown => resolveValueSource(source, action, context.getStateValue);

const resolveTemplate = (
  template: unknown,
  action: Action,
  context: RequestResolutionContext,
): unknown => {
  if (isValueSource(template)) {
    return resolveSource(template, action, context);
  }

  if (Array.isArray(template)) {
    return template.map((entry) => resolveTemplate(entry, action, context));
  }

  if (isPlainObject(template)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(
      template as Record<string, unknown>,
    )) {
      result[key] = resolveTemplate(value, action, context);
    }
    return result;
  }

  return template;
};

/**
 * Interpolates `{{variable}}` templates from environment variables. A
 * variable the environment doesn't define throws: left in place it would go
 * out as a literal `{{name}}` in the url or a header.
 */
const interpolate = (
  input: string,
  variables: Record<string, string> | undefined,
): string =>
  input.replace(/\{\{([^}]+)\}\}/g, (_match, name: string) => {
    const value = variables?.[name.trim()];
    if (value === undefined) {
      throw new Error(`Environment variable "${name.trim()}" is not defined`);
    }
    return value;
  });

const buildUrl = (
  request: ApiRequest,
  baseUrl: string,
  variables: Record<string, string> | undefined,
  action: Action,
  context: RequestResolutionContext,
): string => {
  let path = interpolate(request.path, variables);
  const query: string[] = [];

  for (const [key, source] of Object.entries(request.params ?? {})) {
    const value = resolveSource(source, action, context);
    const isPathToken = path.includes(`{${key}}`);

    if (value === undefined || value === null) {
      // `/users/` is a different endpoint from `/users/{id}`: a path token
      // that resolves to nothing fails the request. A query parameter with no
      // value is simply left out.
      if (isPathToken) {
        throw new Error(
          `Path token "{${key}}" of API request "${request.name}" resolved to nothing`,
        );
      }
      continue;
    }

    const encoded = encodeURIComponent(String(value));

    if (isPathToken) {
      path = path.replaceAll(`{${key}}`, encoded);
    } else {
      query.push(`${encodeURIComponent(key)}=${encoded}`);
    }
  }

  const isAbsolute = /^https?:\/\//i.test(path);
  if (!isAbsolute && !baseUrl) {
    throw new Error(
      `API request "${request.name}" has a relative path and no environment base URL`,
    );
  }

  const absolute = isAbsolute
    ? path
    : `${interpolate(baseUrl, variables).replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;

  return query.length > 0
    ? `${absolute}${absolute.includes('?') ? '&' : '?'}${query.join('&')}`
    : absolute;
};

/**
 * Maps a `mapples:request` action to an executable {@link RequestCommand}.
 * Pure. Returns null for any other action type; a `mapples:request` action
 * that names no request, or one the document doesn't hold, throws — a press
 * that silently does nothing is a wiring defect nobody can see.
 */
export const toRequestCommand = (
  action: Action,
  document: ApiDocument,
  context: RequestResolutionContext = {},
): RequestCommand | null => {
  if (action.type !== RequestActionType.Execute) return null;

  const data = (action.payload?.data ?? {}) as {
    requestId?: string;
    onSuccess?: FollowUpAction;
    onError?: FollowUpAction;
  };

  if (!data.requestId) {
    throw new Error(`A "${RequestActionType.Execute}" action has no requestId`);
  }

  const request = document.requests[data.requestId];
  if (!request) {
    throw new Error(`API request "${data.requestId}" is not in the document`);
  }

  const environment =
    (document.activeEnvironmentId
      ? document.environments[document.activeEnvironmentId]
      : undefined) ?? Object.values(document.environments)[0];

  const variables = environment?.variables;
  const headers: Record<string, string> = {
    ...environment?.headers,
    ...request.headers,
  };

  if (!context.sample) {
    for (const [key, value] of Object.entries(headers)) {
      headers[key] = interpolate(value, variables);
    }
  }

  let auth: TransportAuth | undefined;
  if (request.auth && request.auth.kind !== 'none') {
    if (!request.auth.secretRef) {
      throw new Error(`API request "${request.name}" auth has no secretRef`);
    }
    auth = {
      kind: request.auth.kind,
      header: request.auth.header,
      secretRef: request.auth.secretRef,
    };
  }

  const body = request.body
    ? resolveTemplate(request.body.template, action, context)
    : undefined;

  if (body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return {
    requestId: request.id,
    stateKey: apiRequestStateKey(request),
    url: context.sample
      ? request.path
      : buildUrl(
          request,
          environment?.baseUrl ?? '',
          variables,
          action,
          context,
        ),
    method: request.method,
    headers,
    body,
    auth,
    responseSample: request.responseSample,
    onSuccess: data.onSuccess,
    onError: data.onError,
  };
};

/** The part of a {@link RequestCommand} a transport performs. */
export const toTransportRequest = (
  command: RequestCommand,
): TransportRequest => ({
  requestId: command.requestId,
  method: command.method,
  url: command.url,
  headers: command.headers,
  body: command.body,
  auth: command.auth,
});

/**
 * Whether a request can run with no triggering action: a GET whose params
 * are all literals or app state. An `event` / `data` source only exists when
 * an element fires the request, and `route.*` only once a screen is entered,
 * so those wait for their trigger.
 */
export const isAutoRunnable = (request: ApiRequest): boolean =>
  request.method === 'GET' &&
  Object.values(request.params ?? {}).every(
    (source) =>
      source.kind === 'static' ||
      (source.kind === 'state' && !source.dataProp.startsWith('route.')),
  );
