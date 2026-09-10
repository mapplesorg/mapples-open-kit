---
"@mapples/components": patch
---

`ButtonGroup` provides `ButtonGroupContext` instead of wrapping every child in a cell, so its buttons take equal shares wherever the children come from (an editor rendering them through its own drop area included); buttons no longer need `fullWidth` for it. Overlay layers (`Dialog`, `BottomSheet`, `ActionSheet`, `Snackbar`) take their minimum height from the style provider's canvas dimensions when set and the window height otherwise, so a centred dialog no longer lands below a phone-sized frame. Bottom- and top-aligned overlay content now fills the layer, so `BottomSheet`'s percent `maxHeight` resolves against the layer instead of the sheet's own height — the sheet no longer shrinks and lifts off the bottom edge.
