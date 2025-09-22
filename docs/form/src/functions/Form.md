[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / Form

# Function: Form()

> **Form**\<`T`\>(`props`): `Element`

Defined in: [packages/@mapples/form/src/components/Form.tsx:49](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/components/Form.tsx#L49)

Form component that provides form state management, validation, and submission functionality.
It creates a FormState instance and provides it to child components through React Context.

## Type Parameters

### T

`T` *extends* `object`

The type of the form data object

## Parameters

### props

`PropsWithChildren`\<[`FormProps`](../interfaces/FormProps.md)\<`T`\>\>

Form component props

## Returns

`Element`

JSX element that provides form context to children

## Example

```tsx
interface UserForm {
  name: string;
  email: string;
}

const MyForm = () => (
  <Form<UserForm>
    initialValues={{ name: '', email: '' }}
    validationSchema={userSchema}
    onSubmit={async (values) => {
      await saveUser(values);
    }}
  >
    <FormField name="name" />
    <FormField name="email" />
    <SubmitButton />
  </Form>
);
```
