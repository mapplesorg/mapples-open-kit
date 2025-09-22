[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / useFormHistory

# Function: useFormHistory()

> **useFormHistory**(): `object`

Defined in: [packages/@mapples/form/src/hooks/useFormHistory.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/hooks/useFormHistory.ts#L27)

Hook to manage form history for undo/redo functionality.
This hook provides methods to navigate through form history and check availability of undo/redo operations.

## Returns

`object`

Object containing history navigation methods and state

### prev()

> **prev**: () => `boolean`

#### Returns

`boolean`

### next()

> **next**: () => `boolean`

#### Returns

`boolean`

### canPrev

> **canPrev**: `boolean` = `state.canPrev`

### canNext

> **canNext**: `boolean` = `state.canNext`

## Example

```tsx
const HistoryControls = () => {
  const { prev, next, canPrev, canNext } = useFormHistory();

  return (
    <div>
      <button onClick={prev} disabled={!canPrev}>Undo</button>
      <button onClick={next} disabled={!canNext}>Redo</button>
    </div>
  );
};
```
