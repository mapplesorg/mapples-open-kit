[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/state](../README.md) / useDataProps

# Function: useDataProps()

> **useDataProps**(`data?`): `Dictionary`\<`boolean`\>

Defined in: [hooks/useDataProps.ts:35](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/state/src/hooks/useDataProps.ts#L35)

Hook for processing multiple data properties and returning resolved values.

This hook takes a DataProps object and processes each property using the
getValue function from useDataState. It filters out undefined values and
returns a clean object with only the resolved, active data properties.

## Parameters

### data?

`Partial`\<`Record`\<`string`, [`DataProp`](../../types/interfaces/DataProp.md)\>\>

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
