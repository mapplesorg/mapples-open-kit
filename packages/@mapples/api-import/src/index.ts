/**
 * @fileoverview Turns API descriptions — a cURL command, an OpenAPI 3 or
 * Swagger 2 document, a Postman collection — into Mapples API requests, and
 * folds them into a project API document. Pure and runtime-neutral: no Node
 * or browser APIs, nothing fetched. Shared by the Creator's import dialog and
 * the `mapples` CLI.
 */
import { importCurl, looksLikeCurl } from './curl.js';
import { importOpenApi, looksLikeOpenApi } from './openapi.js';
import { importPostman, looksLikePostman } from './postman.js';
import type { ApiImportResult } from './types.js';

export { restoreBodyCredential } from './bodyCredentials.js';
export { importCurl, looksLikeCurl } from './curl.js';
export { mergeApiImport } from './merge.js';
export type { MergeApiImportOptions, MergeApiImportResult } from './merge.js';
export { nameFromRoute, toRequestName, uniqueName } from './names.js';
export { importOpenApi, looksLikeOpenApi } from './openapi.js';
export type { OpenApiImportOptions } from './openapi.js';
export { importPostman, looksLikePostman } from './postman.js';
export { swaggerToOpenApi } from './swagger.js';
export type {
  ApiImportResult,
  BodyCredential,
  ImportedRequest,
} from './types.js';

/** Imports `text` as whichever format it is; anything else throws. */
export const importApiText = (text: string): ApiImportResult => {
  if (looksLikeCurl(text)) return importCurl(text);
  if (looksLikePostman(text)) return importPostman(text);
  if (looksLikeOpenApi(text)) return importOpenApi(text);
  throw new Error(
    'Paste a cURL command, an OpenAPI 3 / Swagger 2 document (JSON or YAML) or a Postman collection',
  );
};
