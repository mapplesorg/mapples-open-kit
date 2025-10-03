[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/form](../README.md) / useFormFieldToggle

# Function: useFormFieldToggle()

> **useFormFieldToggle**(`fieldPath`): `object`

Defined in: [hooks/useFormFieldToggle.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/form/src/hooks/useFormFieldToggle.ts#L32)

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
