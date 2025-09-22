[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/form](../README.md) / useFormContext

# Function: useFormContext()

> **useFormContext**(): [`FormContextType`](../interfaces/FormContextType.md)\<`object`\>

Defined in: [hooks/useFormContext.ts:30](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/hooks/useFormContext.ts#L30)

Hook to access the form context containing form state and methods.
This hook provides access to the FormState instance, validation errors,
submission state, and form control methods.

## Returns

[`FormContextType`](../interfaces/FormContextType.md)\<`object`\>

Form context object with form state and methods

## Example

```tsx
const MyComponent = () => {
  const { form, submitting, submitForm, validationErrors } = useFormContext();

  return (
    <div>
      <button onClick={submitForm} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
      {validationErrors && <div>Validation errors occurred</div>}
    </div>
  );
};
```
