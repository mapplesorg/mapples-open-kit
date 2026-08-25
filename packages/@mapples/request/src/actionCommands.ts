import {
  Action,
  ApiDocument,
  ApiRequest,
  ApiValueSource,
  apiRequestStateKey,
  HttpMethod,
} from '@mapples/types';
import { get, isPlainObject } from 'lodash';

import { RequestActionType } from './constants';

/** A follow-up action re-emitted after the request settles. */
export interface FollowUpAction {
  type: string;
  data?: unknown;
}

/** A fully-resolved request, ready to execute. */
export interface RequestCommand {
  requestId: string;
  stateKey: string;
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  responseSample?: unknown;
  onSuccess?: FollowUpAction;
  onError?: FollowUpAction;
}

/** Everything value resolution may need at emit time. */
export interface RequestResolutionContext {
  /** Resolves `state`-kind value sources (a `@mapples/state` lookup). */
  getStateValue?: (path: string) => unknown;
  /** Secrets by `secretRef`, resolved by the host — never stored. */
  secrets?: Record<string, string>;
}

const isValueSource = (value: unknown): value is ApiValueSource =>
  isPlainObject(value) &&
  ['static', 'state', 'event'].includes(
    (value as { kind?: string }).kind ?? '',
  );

const resolveSource = (
  source: ApiValueSource,
  action: Action,
  context: RequestResolutionContext,
): unknown => {
  switch (source.kind) {
    case 'static':
      return source.value;
    case 'state':
      return context.getStateValue?.(source.dataProp);
    case 'event': {
      const payload = action.payload?.data;
      return source.path ? get(payload, source.path) : payload;
    }
  }
};

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

/** Interpolates `{{variable}}` templates from environment variables. */
const interpolate = (
  input: string,
  variables: Record<string, string> | undefined,
): string =>
  input.replace(/\{\{([^}]+)\}\}/g, (match, name: string) => {
    const value = variables?.[name.trim()];
    return value !== undefined ? value : match;
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
    const encoded = encodeURIComponent(String(value ?? ''));

    if (path.includes(`{${key}}`)) {
      path = path.replaceAll(`{${key}}`, encoded);
    } else {
      query.push(`${encodeURIComponent(key)}=${encoded}`);
    }
  }

  const absolute = /^https?:\/\//i.test(path)
    ? path
    : `${interpolate(baseUrl, variables).replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;

  return query.length > 0
    ? `${absolute}${absolute.includes('?') ? '&' : '?'}${query.join('&')}`
    : absolute;
};

/**
 * Maps a `mapples:request` action to an executable {@link RequestCommand} —
 * pure and unit-testable; returns null for anything else or when the request
 * id doesn't resolve.
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

  if (!data.requestId) return null;

  const request = document.requests[data.requestId];
  if (!request) return null;

  const environment =
    (document.activeEnvironmentId
      ? document.environments[document.activeEnvironmentId]
      : undefined) ?? Object.values(document.environments)[0];

  const variables = environment?.variables;
  const headers: Record<string, string> = {
    ...environment?.headers,
    ...request.headers,
  };

  for (const [key, value] of Object.entries(headers)) {
    headers[key] = interpolate(value, variables);
  }

  if (request.auth && request.auth.kind !== 'none' && request.auth.secretRef) {
    const secret = context.secrets?.[request.auth.secretRef];
    if (secret !== undefined) {
      if (request.auth.kind === 'bearer') {
        headers.Authorization = `Bearer ${secret}`;
      } else {
        headers[request.auth.header ?? 'Authorization'] = secret;
      }
    }
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
    url: buildUrl(
      request,
      environment?.baseUrl ?? '',
      variables,
      action,
      context,
    ),
    method: request.method,
    headers,
    body,
    responseSample: request.responseSample,
    onSuccess: data.onSuccess,
    onError: data.onError,
  };
};
