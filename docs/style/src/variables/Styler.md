[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / Styler

# Variable: Styler

> `const` **Styler**: `object`

Defined in: [packages/@mapples/style/src/utils/style.ts:96](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/utils/style.ts#L96)

Styler utility object providing style creation and management functions.

## Type Declaration

### create()

> **create**: \<`T`\>(`style`) => `T`

Creates a styled styles object with enhanced sizing support.

#### Type Parameters

##### T

`T` *extends* [`StyledNamedStyles`](../type-aliases/StyledNamedStyles.md)\<`T`\> \| [`StyledNamedStyles`](../type-aliases/StyledNamedStyles.md)\<`any`\>

#### Parameters

##### style

`T` & [`StyledNamedStyles`](../type-aliases/StyledNamedStyles.md)\<`T`\>

The styles object to create

#### Returns

`T`

The created styles object with enhanced sizing capabilities

#### Example

```tsx
const styles = Styler.create({
  container: {
    padding: 'sizing.md',
    backgroundColor: 'theme.colors.background'
  }
});
```

### init()

> **init**: (`style?`) => [`StyleContextType`](../interfaces/StyleContextType.md)

Initializes a complete style configuration by merging custom settings with defaults.

#### Parameters

##### style?

[`DeepPartial`](../type-aliases/DeepPartial.md)\<[`StyleContextType`](../interfaces/StyleContextType.md)\>

Optional partial style configuration to merge with defaults

#### Returns

[`StyleContextType`](../interfaces/StyleContextType.md)

Complete style configuration with all required properties

#### Example

```tsx
const styleConfig = Styler.init({
  themeConfig: {
    variant: 'dark',
    light: { colors: { primary: '#007AFF' } }
  }
});
```

### flatten()

> **flatten**: \<`T`\>(`style?`) => [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\> *extends* `U`[] ? `U` : [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>

Flattens a style prop into a single style object.

#### Type Parameters

##### T

`T` *extends* `object`

#### Parameters

##### style?

`StyleProp`\<[`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>\>

The style prop to flatten

#### Returns

[`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\> *extends* `U`[] ? `U` : [`SizableStyleProps`](../type-aliases/SizableStyleProps.md)\<`T`\>

Flattened style object

#### Example

```tsx
const flattenedStyle = Styler.flatten([
  { padding: 10 },
  { margin: 5 },
  { backgroundColor: 'red' }
]);
```
