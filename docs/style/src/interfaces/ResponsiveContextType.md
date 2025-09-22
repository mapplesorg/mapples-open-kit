[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / ResponsiveContextType

# Interface: ResponsiveContextType

Defined in: [packages/@mapples/style/src/types/context.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/context.ts#L25)

Responsive context type that extends responsive configuration with runtime state.
Contains current breakpoint information and window dimensions.

## Extends

- [`ResponsiveConfig`](ResponsiveConfig.md)

## Properties

### windowWidth

> **windowWidth**: `number`

Defined in: [packages/@mapples/style/src/types/context.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/context.ts#L27)

Current window width in pixels

***

### currentBreakpoint

> **currentBreakpoint**: `string`

Defined in: [packages/@mapples/style/src/types/context.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/context.ts#L29)

Currently active breakpoint name

***

### setBreakpoint()

> **setBreakpoint**: (`breakpoint`) => `void`

Defined in: [packages/@mapples/style/src/types/context.ts:31](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/context.ts#L31)

Function to manually set the current breakpoint

#### Parameters

##### breakpoint

`string`

#### Returns

`void`

***

### default

> **default**: `string`

Defined in: [packages/@mapples/style/src/types/responsive.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/responsive.ts#L21)

Default breakpoint to use when no breakpoint matches

#### Inherited from

[`ResponsiveConfig`](ResponsiveConfig.md).[`default`](ResponsiveConfig.md#default)

***

### breakpoints

> **breakpoints**: `Record`\<`Breakpoint`, [`BreakpointConfig`](BreakpointConfig.md)\>

Defined in: [packages/@mapples/style/src/types/responsive.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/types/responsive.ts#L23)

Map of breakpoint names to their configuration

#### Inherited from

[`ResponsiveConfig`](ResponsiveConfig.md).[`breakpoints`](ResponsiveConfig.md#breakpoints)
