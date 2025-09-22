[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / useFormContext

# Function: useFormContext()

> **useFormContext**(): [`FormContextType`](../interfaces/FormContextType.md)\<`object`\>

Defined in: [packages/@mapples/form/src/hooks/useFormContext.ts:30](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/hooks/useFormContext.ts#L30)

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
