[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [state/src](../README.md) / useDataState

# Function: useDataState()

> **useDataState**(): `object`

Defined in: [packages/@mapples/state/src/hooks/useDataState.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/state/src/hooks/useDataState.ts#L34)

Hook for accessing and retrieving values from the application state.

This hook provides access to the state context and includes a getValue function
that can retrieve values from the state using various key formats and patterns.

## Returns

An object containing the getValue function for state access

### getValue()

> **getValue**: (`dataProp`, `altValue`) => `undefined` \| `string` \| `object`

Retrieves a value from the state using a DataProp configuration.

Supports various key formats:
- Simple keys: 'user.name' - retrieves nested property
- Multiple keys with separator: 'key1;key2;separator' - joins multiple values
- Special key '(this)': returns the entire state object

#### Parameters

##### dataProp

[`DataProp`](../../../types/src/interfaces/DataProp.md)

The data property configuration

##### altValue

`string` = `'N/A'`

Alternative value to return if the key is not found (default: 'N/A')

#### Returns

`undefined` \| `string` \| `object`

The retrieved value, undefined if inactive, or altValue if not found

#### Example

```tsx
// Simple property access
const name = getValue({ key: 'user.name', active: true });

// Multiple values with custom separator
const address = getValue({ key: 'user.street;user.city;user.state; ', active: true });

// With custom fallback
const age = getValue({ key: 'user.age', active: true }, 'Unknown');
```

## Example

```tsx
const MyComponent = () => {
  const { getValue } = useDataState();

  // Get a simple value
  const userName = getValue({ key: 'user.name', active: true });

  // Get multiple values joined with separator
  const fullName = getValue({ key: 'user.firstName;user.lastName; ', active: true });

  // Get the entire state object
  const entireState = getValue({ key: '(this)', active: true });

  return <div>Hello, {userName}!</div>;
};
```
