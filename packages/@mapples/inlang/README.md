# @mapples/inlang

Internal language utilities for the Mapples Open Kit. This package provides parsing and evaluation helpers for "this" references, dimension strings, and condition strings used across the Mapples ecosystem (e.g. data bindings, visibility conditions, layout).

## Features

- **This references** – Parse and detect `"this"` and `"this::n"` style action/context references
- **Data this** – Parse `(this)` and dot-separated paths for data binding
- **Dimensions** – Parse dimension strings (e.g. `"w::50"`, `"height::100"`) for width/height
- **Conditions** – Parse and evaluate condition strings (`dataProp::condition::value`) for visibility and logic
- **TypeScript** – Full type definitions and TSDoc

## Installation

```bash
npm install @mapples/inlang
# or
yarn add @mapples/inlang
```

## Overview

`@mapples/inlang` is used by other Mapples packages (e.g. render, form, ui) to interpret configuration strings. It does not depend on React or React Native.

## API Reference

### Constants

- **`FN_SEPARATOR`** – `'::'` – Separator used in "this", dim, and condition strings
- **`DATA_THIS`** – `'(this)'` – Prefix for data-context reference (entire state)
- **`DOT_SEPARATOR`** – `'.'` – Separator for object paths (e.g. `user.name`)

### This (action/context references)

- **`This`** – Type: `['this', string?]`
- **`isThis(value?)`** – Returns whether the string matches `"this"` or `"this::n"`
- **`isDataThis(value?)`** – Returns whether the string starts with `(this)`
- **`parseDataThis(value)`** – Strips `(this)` and splits by dot (path segments)
- **`parseThis(value?)`** – Parses to `['this', n?]` (e.g. `"this::2"` → `['this', '2']`)

### Dims (dimension strings)

- **`DimType`** – `'width' | 'height'`
- **`Dims`** – `[DimType, number]` (e.g. `['width', 0.5]` for 50%)
- **`DimsString`** – `'w' | 'h' | 'width' | 'height'`
- **`parseDims(dim)`** – Parses strings like `"w::50"` or `"height::100"` to `[type, 0..1]` or `null`

### State (conditions)

#### Types

- **`Conditions`** – Enum: `equals` (`'eq'`), `notEquals` (`'neq'`)
- **`SimpleCondition`** – `${string}::${Conditions}::${string}`
- **`BoolCondition`** – Condition string with `'true'` or `'false'` as value
- **`ConditionFunc`** – `(a, b) => boolean`
- **`ValueType`** – `'string' | 'number' | 'boolean' | 'dataProp'`
- **`ParseConditionResult`** – `{ dataProp, condition, valueProp, valueType }`

#### Regexp

- **`ConditionStringRegExp`** – Regex used to split condition strings on `::` (respecting quoted segments)

#### Utils

- **`toConditionString(...values)`** – Joins values with `FN_SEPARATOR`
- **`parseConditionString(value)`** – Splits a condition string into parts (valueType default `'string'`)
- **`parseCondition(value)`** – Parses `SimpleCondition | BoolCondition` into `ParseConditionResult` (handles booleans and quoted types)
- **`isCondition(value)`** – Type guard for valid condition strings
- **`toBool(value)`** – Converts string/boolean to boolean (`"true"` → true)
- **`toNumber(value)`** – Converts string/boolean to number (booleans → 0/1)
- **`parseJoin(key?)`** – Splits key by `;` and removes newlines (for multi-key data props)

#### Conditions (evaluators)

- **`eq`** – `(a, b) => a === b`
- **`notEq`** – `(a, b) => a !== b`
- **`conditionMap`** – `Record<Conditions, ConditionFunc>` mapping enum to functions

## Usage examples

```typescript
import {
  isThis,
  isDataThis,
  parseDataThis,
  parseThis,
  parseDims,
  DATA_THIS,
  FN_SEPARATOR,
} from '@mapples/inlang';

// This
isThis('"this"');        // true
isThis('"this::1"');      // true
parseThis('"this::2"');  // ['this', '2']

// Data this
isDataThis('(this)');           // true
isDataThis('(this).user.name'); // true
parseDataThis('(this).user.name'); // ['user', 'name']

// Dims
parseDims('"w::50"');   // ['width', 0.5]
parseDims('"h::100"');  // ['height', 1]
parseDims('"width"');   // ['width', 1]
```

```typescript
import {
  parseCondition,
  isCondition,
  toBool,
  toNumber,
  Conditions,
  conditionMap,
} from '@mapples/inlang';

const r = parseCondition('user.age::eq::18' as any);
// r.dataProp === 'user.age', r.condition === Conditions.equals, r.valueProp === '18'

const br = parseCondition('user.active::eq::true' as any);
// br.valueProp === true, br.valueType === 'boolean'

isCondition('user.role::eq::admin'); // true
toBool('true');  // true
toNumber('42');  // 42

const fn = conditionMap[Conditions.equals];
fn(1, 1); // true
```

## Integration

Used by:

- **@mapples/render** – Data props and condition-based visibility
- **@mapples/form** – Field bindings and conditional logic
- **@mapples/ui** – Component props and layout hints

## License

MIT

## Author

Oleksandr Soloviov – [mapples.org](https://mapples.org/people/olek_soloviov)
