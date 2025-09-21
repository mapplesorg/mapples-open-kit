[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / useFormSubmit

# Function: useFormSubmit()

> **useFormSubmit**(): `object`

Defined in: [hooks/useFormSubmit.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/hooks/useFormSubmit.ts#L24)

Hook to access form submission state and submit function.
This hook provides the current submission state and the submit function.

## Returns

`object`

Object containing submission state and submit function

### submitForm()

> **submitForm**: () => `void`

#### Returns

`void`

### submitting

> **submitting**: `boolean`

## Example

```tsx
const SubmitButton = () => {
  const { submitting, submitForm } = useFormSubmit();

  return (
    <button onClick={submitForm} disabled={submitting}>
      {submitting ? 'Submitting...' : 'Submit'}
    </button>
  );
};
```
