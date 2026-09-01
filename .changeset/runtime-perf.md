---
'@mapples/form': patch
'@mapples/dnd': patch
'@mapples/state': patch
'@mapples/action': patch
---

Runtime performance: `@mapples/form` scopes subscription clones to the subscribed subtree, filters notifications by path prefix and coalesces history writes during bursts; `@mapples/dnd` gains race-free drop registration, a monitor id index and coalesced layout broadcasts; `@mapples/state` and `@mapples/action` memoize their provider context values.
