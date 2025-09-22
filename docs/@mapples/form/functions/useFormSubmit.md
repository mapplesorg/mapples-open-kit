[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/form](../README.md) / useFormSubmit

# Function: useFormSubmit()

> **useFormSubmit**(): `object`

Defined in: [hooks/useFormSubmit.ts:24](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/hooks/useFormSubmit.ts#L24)

Hook to access form submission state and submit function.
This hook provides the current submission state and the submit function.

## Returns

`object`

Object containing submission state and submit function

### submitting

> **submitting**: `boolean`

### submitForm()

> **submitForm**: () => `void`

#### Returns

`void`

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
