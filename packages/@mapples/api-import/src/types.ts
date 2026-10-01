import type { ApiRequest, ApiValueSource } from '@mapples/types';

/** A request as an importer produces it: no id yet, path relative to `baseUrl`. */
export type ImportedRequest = Omit<ApiRequest, 'id'>;

export interface ApiImportResult {
  /** Where the source came from — shown in the import preview. */
  format: 'curl' | 'openapi' | 'swagger' | 'postman';
  /**
   * The origin the requests' relative paths hang off (`https://api.acme.com/v1`).
   * The store decides whether that becomes an environment or the paths are
   * made absolute.
   */
  baseUrl: string;
  /** A name for the environment `baseUrl` may become. */
  environmentName: string;
  requests: ImportedRequest[];
  /**
   * `{{name}}` values the requests' url/header templates read (a Postman
   * collection's variables). They become the environment's variables; a
   * credential-looking one is never imported, only named in `warnings`.
   */
  variables?: Record<string, string>;
  /**
   * What the import left out on purpose — above all secrets: a token found in
   * the source is never imported, only the name of the secret to store it as.
   */
  warnings: string[];
  /**
   * Credential-like fields found in a request body (`password`, `token`, …).
   * The requests already read them from `replacement` instead; the values
   * are kept here only so the author can explicitly choose to keep them.
   */
  bodyCredentials?: BodyCredential[];
}

/** A credential-like body field the importer took out of a request body. */
export interface BodyCredential {
  /** Index into `ApiImportResult.requests`. */
  requestIndex: number;
  /** Where in the body template the field sits. */
  path: string[];
  /** The value found in the source. */
  value: string;
  /** What the body reads instead. */
  replacement: ApiValueSource;
}
