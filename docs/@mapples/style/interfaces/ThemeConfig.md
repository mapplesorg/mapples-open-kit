[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / ThemeConfig

# Interface: ThemeConfig

Defined in: [types/theme.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L25)

Complete theme configuration for light and dark modes.
Supports automatic theme switching based on device preferences.

## Properties

### variant

> **variant**: `"light"` \| `"dark"` \| `"auto"`

Defined in: [types/theme.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L27)

Theme variant: 'light', 'dark', or 'auto' for automatic switching

***

### defaultColor

> **defaultColor**: [`Color`](../type-aliases/Color.md)

Defined in: [types/theme.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L29)

Default color to use when a color path is not found

***

### light

> **light**: [`ThemeMap`](ThemeMap.md)

Defined in: [types/theme.ts:31](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L31)

Light theme color definitions

***

### dark

> **dark**: [`ThemeMap`](ThemeMap.md)

Defined in: [types/theme.ts:33](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L33)

Dark theme color definitions

***

### \_displayTheme

> **\_displayTheme**: `"light"` \| `"dark"`

Defined in: [types/theme.ts:35](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/theme.ts#L35)

Internal property for display theme tracking
