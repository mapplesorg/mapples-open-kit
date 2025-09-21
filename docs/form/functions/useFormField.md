[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / useFormField

# Function: useFormField()

> **useFormField**\<`T`\>(`fieldPath`, `fallbackValue?`, `subscribe?`): `object`

Defined in: [hooks/useFormField.ts:38](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/hooks/useFormField.ts#L38)

Hook to manage a single form field with value, validation, and touch state.
This hook provides reactive access to a form field's value, errors, and touch state,
along with methods to update the value and trigger validation.

## Type Parameters

### T

`T`

The type of the field value

## Parameters

### fieldPath

`string`

Dot notation path to the field (e.g., 'user.name')

### fallbackValue?

`T`

Default value to use if field is undefined

### subscribe?

`boolean`

Whether to subscribe to real-time value changes (default: true)

## Returns

`object`

Object containing field value, error state, and control methods

### error

> **error**: `undefined` \| `string`

### errors

> **errors**: `undefined` \| `ValidationError`[]

### isTouched

> **isTouched**: `boolean`

### setValue()

> **setValue**: (`newValue`) => `void` = `handleSetValue`

#### Parameters

##### newValue

`T`

#### Returns

`void`

### touch()

> **touch**: (`fieldName`) => `void`

#### Parameters

##### fieldName

`string`

#### Returns

`void`

### validate()

> **validate**: () => `void`

#### Returns

`void`

### value

> **value**: `undefined` \| `T`

## Example

```tsx
const NameField = () => {
  const { value, error, isTouched, setValue, touch } = useFormField<string>('name', '');

  return (
    <div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => touch('name')}
      />
      {isTouched && error && <span className="error">{error}</span>}
    </div>
  );
};
```
