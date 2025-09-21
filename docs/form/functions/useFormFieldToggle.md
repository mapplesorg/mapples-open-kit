[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / useFormFieldToggle

# Function: useFormFieldToggle()

> **useFormFieldToggle**(`fieldPath`): `object`

Defined in: [hooks/useFormFieldToggle.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/hooks/useFormFieldToggle.ts#L32)

Hook to manage boolean toggle fields.
This hook provides a simple way to handle boolean fields with toggle functionality.

## Parameters

### fieldPath

`string`

Dot notation path to the boolean field

## Returns

`object`

Object containing current value and toggle function

### toggleValue()

> **toggleValue**: () => `void` = `handleToggleValue`

#### Returns

`void`

### value

> **value**: `boolean`

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
