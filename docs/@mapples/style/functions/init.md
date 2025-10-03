[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / init

# Function: init()

> **init**(`style?`): [`StyleContextType`](../interfaces/StyleContextType.md)

Defined in: [utils/style.ts:55](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/utils/style.ts#L55)

Initializes a complete style configuration by merging custom settings with defaults.

## Parameters

### style?

[`DeepPartial`](../type-aliases/DeepPartial.md)\<[`StyleContextType`](../interfaces/StyleContextType.md)\>

Optional partial style configuration to merge with defaults

## Returns

[`StyleContextType`](../interfaces/StyleContextType.md)

Complete style configuration with all required properties

## Example

```tsx
const styleConfig = Styler.init({
  themeConfig: {
    variant: 'dark',
    light: { colors: { primary: '#007AFF' } }
  }
});
```
