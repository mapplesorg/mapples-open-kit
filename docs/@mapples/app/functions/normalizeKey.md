[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/app](../README.md) / normalizeKey

# Function: normalizeKey()

> **normalizeKey**(`key`): `undefined` \| \{ `type`: `string`; `id`: `string`; `name`: `string`; \}

Defined in: [utils.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/app/src/utils.ts#L25)

Normalizes a reference key by extracting type, id, and name information.

This function parses reference keys in the format `ref(type:id:name)` and extracts
the individual components. It's used internally for processing asset references.

## Parameters

### key

`string`

The reference key to normalize, either in `ref(type:id:name)` format or a plain string

## Returns

`undefined` \| \{ `type`: `string`; `id`: `string`; `name`: `string`; \}

An object containing the parsed type, id, and normalized name, or undefined if the key format is invalid

## Examples

```typescript
const result = normalizeKey('ref(font:123:MyFont.ttf)');
// Returns: { type: 'font', id: '123', name: 'MyFont' }
```

```typescript
const result = normalizeKey('plain-string');
// Returns: undefined (invalid format)
```
