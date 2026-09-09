---
'@mapples/state': patch
'@mapples/form': patch
---

A `dataProps` binding whose variable holds no value now resolves to nothing, so the prop falls back to the component default — it previously read the `'N/A'` sentinel, and a bound `Switch` rendered ON from a truthy string.

`useFormFieldToggle` seeds from the stored field and subscribes to it: a field already stored as `true` renders on, and writes from elsewhere are picked up instead of being shadowed by the hook's own state.
