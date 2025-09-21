[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / useFormHistory

# Function: useFormHistory()

> **useFormHistory**(): `object`

Defined in: [hooks/useFormHistory.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/hooks/useFormHistory.ts#L27)

Hook to manage form history for undo/redo functionality.
This hook provides methods to navigate through form history and check availability of undo/redo operations.

## Returns

`object`

Object containing history navigation methods and state

### canNext

> **canNext**: `boolean` = `state.canNext`

### canPrev

> **canPrev**: `boolean` = `state.canPrev`

### next()

> **next**: () => `boolean`

#### Returns

`boolean`

### prev()

> **prev**: () => `boolean`

#### Returns

`boolean`

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
