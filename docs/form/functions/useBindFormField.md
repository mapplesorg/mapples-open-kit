[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / useBindFormField

# Function: useBindFormField()

> **useBindFormField**\<`T`\>(`fieldPath`, `fallBackPath?`, `fallbackValue?`, `subscribe?`): `object`

Defined in: [hooks/useBindFormField.ts:39](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/hooks/useBindFormField.ts#L39)

Hook to bind a form field with optional fallback path synchronization.
This hook is similar to useFormField but allows binding a field to a fallback path,
useful for creating field aliases or synchronized fields.

## Type Parameters

### T

`T`

The type of the field value

## Parameters

### fieldPath

`string`

Primary dot notation path to the field

### fallBackPath?

`string`

Optional fallback path to synchronize with

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
  const { value, error, setValue } = useBindFormField<string>(
    'user.name',
    'displayName', // Also update displayName when user.name changes
    ''
  );

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
```
