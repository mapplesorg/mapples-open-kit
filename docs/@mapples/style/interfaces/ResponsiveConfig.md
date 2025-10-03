[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / ResponsiveConfig

# Interface: ResponsiveConfig

Defined in: [types/responsive.ts:19](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/responsive.ts#L19)

Responsive configuration for breakpoint management.
Defines available breakpoints and their width ranges.

## Extended by

- [`ResponsiveContextType`](ResponsiveContextType.md)

## Properties

### default

> **default**: `string`

Defined in: [types/responsive.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/responsive.ts#L21)

Default breakpoint to use when no breakpoint matches

***

### breakpoints

> **breakpoints**: `Record`\<[`Breakpoint`](../type-aliases/Breakpoint.md), [`BreakpointConfig`](BreakpointConfig.md)\>

Defined in: [types/responsive.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/style/src/types/responsive.ts#L23)

Map of breakpoint names to their configuration
