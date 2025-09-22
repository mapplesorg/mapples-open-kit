[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / ThemeConfig

# Interface: ThemeConfig

Defined in: [packages/@mapples/style/src/types/theme.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L25)

Complete theme configuration for light and dark modes.
Supports automatic theme switching based on device preferences.

## Properties

### variant

> **variant**: `"light"` \| `"dark"` \| `"auto"`

Defined in: [packages/@mapples/style/src/types/theme.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L27)

Theme variant: 'light', 'dark', or 'auto' for automatic switching

***

### defaultColor

> **defaultColor**: [`Color`](../type-aliases/Color.md)

Defined in: [packages/@mapples/style/src/types/theme.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L29)

Default color to use when a color path is not found

***

### light

> **light**: [`ThemeMap`](ThemeMap.md)

Defined in: [packages/@mapples/style/src/types/theme.ts:31](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L31)

Light theme color definitions

***

### dark

> **dark**: [`ThemeMap`](ThemeMap.md)

Defined in: [packages/@mapples/style/src/types/theme.ts:33](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L33)

Dark theme color definitions

***

### \_displayTheme

> **\_displayTheme**: `"light"` \| `"dark"`

Defined in: [packages/@mapples/style/src/types/theme.ts:35](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/style/src/types/theme.ts#L35)

Internal property for display theme tracking
