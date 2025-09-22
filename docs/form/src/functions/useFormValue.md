[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / useFormValue

# Function: useFormValue()

> **useFormValue**\<`T`\>(`fieldPath?`): `undefined` \| `T`

Defined in: [packages/@mapples/form/src/hooks/useFormValue.ts:30](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/form/src/hooks/useFormValue.ts#L30)

Hook to get a reactive value from the form state.
This hook subscribes to value changes and returns the current value.

## Type Parameters

### T

`T`

The type of the value to retrieve

## Parameters

### fieldPath?

`string`

Optional dot notation path to the field. If not provided, returns all form values

## Returns

`undefined` \| `T`

The current value at the specified path or all form values

## Example

```tsx
const MyComponent = () => {
  const userName = useFormValue<string>('user.name');
  const allValues = useFormValue<UserForm>();

  return (
    <div>
      <p>User name: {userName}</p>
      <p>All values: {JSON.stringify(allValues)}</p>
    </div>
  );
};
```
