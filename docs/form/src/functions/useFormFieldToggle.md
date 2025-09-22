[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / useFormFieldToggle

# Function: useFormFieldToggle()

> **useFormFieldToggle**(`fieldPath`): `object`

Defined in: [packages/@mapples/form/src/hooks/useFormFieldToggle.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/hooks/useFormFieldToggle.ts#L32)

Hook to manage boolean toggle fields.
This hook provides a simple way to handle boolean fields with toggle functionality.

## Parameters

### fieldPath

`string`

Dot notation path to the boolean field

## Returns

`object`

Object containing current value and toggle function

### value

> **value**: `boolean`

### toggleValue()

> **toggleValue**: () => `void` = `handleToggleValue`

#### Returns

`void`

## Example

```tsx
const ToggleField = () => {
  const { value, toggleValue } = useFormFieldToggle('isActive');

  return (
    <label>
      <input
        type="checkbox"
        checked={value}
        onChange={toggleValue}
      />
      Active
    </label>
  );
};
```
