# @mapples/api-import

Turns API descriptions into Mapples API requests (`ApiRequest` from `@mapples/types`) and
merges them into a project's API document. Pure and runtime-neutral — no network, no
filesystem — so the Creator's import dialog and the `mapples` CLI share one implementation.

| Input                                     | Function                            |
| ----------------------------------------- | ----------------------------------- |
| cURL command                              | `importCurl(text)`                  |
| OpenAPI 3.x or Swagger 2.0 (JSON or YAML) | `importOpenApi(text, { baseUrl? })` |
| Postman collection v2.0 / v2.1            | `importPostman(text)`               |
| any of the above                          | `importApiText(text)`               |

`mergeApiImport(document, result, { mintId, onConflict: 'rename' | 'replace' })` folds an
import into an `ApiDocument` and returns a new one.

Credentials are never imported: tokens, API keys and credential-looking variables become
the _name_ of a secret to store (`auth.secretRef`) plus a warning.
