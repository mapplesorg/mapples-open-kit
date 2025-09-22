[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [state/src](../README.md) / useDataProps

# Function: useDataProps()

> **useDataProps**(`data?`): `Dictionary`\<`boolean`\>

Defined in: [packages/@mapples/state/src/hooks/useDataProps.ts:35](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/state/src/hooks/useDataProps.ts#L35)

Hook for processing multiple data properties and returning resolved values.

This hook takes a DataProps object and processes each property using the
getValue function from useDataState. It filters out undefined values and
returns a clean object with only the resolved, active data properties.

## Parameters

### data?

`Partial`\<`Record`\<`string`, [`DataProp`](../../../types/src/interfaces/DataProp.md)\>\>

Optional object containing DataProp configurations

## Returns

`Dictionary`\<`boolean`\>

A memoized object containing resolved values from the data props

## Example

```tsx
const MyComponent = () => {
  const dataProps = {
    name: { key: 'user.name', active: true },
    email: { key: 'user.email', active: true },
    age: { key: 'user.age', active: false }, // This will be filtered out
    address: { key: 'user.street;user.city; ', active: true }
  };

  const resolvedProps = useDataProps(dataProps);
  // Result: { name: 'John', email: 'john@example.com', address: '123 Main St New York' }

  return <div>{resolvedProps.name} - {resolvedProps.email}</div>;
};
```
