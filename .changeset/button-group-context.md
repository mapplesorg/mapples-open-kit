---
"@mapples/ui": minor
---

`ButtonGroupContext` (`direction`, `equal`, `fill`) is exported next to `Button`, and `Button` sizes itself from it: an equal share of a row (a zero basis when the group spans its parent, the labels' width otherwise) and the full width of a column. It applies to the bare and themed renders alike; author styles still override it.
