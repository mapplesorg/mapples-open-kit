[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / useFormState

# Function: useFormState()

> **useFormState**\<`T`\>(): `object`

Defined in: [packages/@mapples/form/src/hooks/useFormState.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/hooks/useFormState.ts#L32)

Hook to manage the entire form state with reactive values and control methods.
This hook provides access to all form values and methods to update them.

## Type Parameters

### T

`T` *extends* `object`

The type of the form data object

## Returns

`object`

Object containing form values and control methods

### values

> **values**: `undefined` \| `T`

### setValues()

> **setValues**: (`values`) => `void`

#### Parameters

##### values

`T`

#### Returns

`void`

### getValues()

> **getValues**: () => `undefined` \| `T`

#### Returns

`undefined` \| `T`

## Example

```tsx
const MyComponent = () => {
  const { values, setValues, getValues } = useFormState<UserForm>();

  const handleReset = () => {
    setValues({ name: '', email: '' });
  };

  return (
    <div>
      <p>Current values: {JSON.stringify(values)}</p>
      <button onClick={handleReset}>Reset Form</button>
    </div>
  );
};
```
