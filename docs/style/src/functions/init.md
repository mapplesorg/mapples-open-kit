[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / init

# Function: init()

> **init**(`style?`): [`StyleContextType`](../interfaces/StyleContextType.md)

Defined in: [packages/@mapples/style/src/utils/style.ts:55](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/utils/style.ts#L55)

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
