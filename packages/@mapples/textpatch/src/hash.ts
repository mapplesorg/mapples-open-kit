/**
 * The `b3:` content hash of a text: BLAKE3 over the canonical JSON of the
 * string value, 20 hex chars — exactly what the JPATCH engines and the
 * server compute for any JSON value (RFC-0001 §4). For a string the
 * canonical form is `JSON.stringify(text)`; `json.dumps(ensure_ascii=False)`
 * agrees byte for byte on every string the server accepts (lone surrogates
 * are rejected as SOURCE_INVALID before any hash is taken).
 */

import { blake3 } from '@noble/hashes/blake3.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';

const HASH_PREFIX = 'b3:';
const PREFIX_HEX = 20;

export const textHash = (text: string): string =>
  HASH_PREFIX +
  bytesToHex(blake3(utf8ToBytes(JSON.stringify(text)))).slice(0, PREFIX_HEX);
