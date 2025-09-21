[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / ResponsiveContextType

# Interface: ResponsiveContextType

Defined in: [packages/@mapples/style/src/types/context.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/context.ts#L25)

Responsive context type that extends responsive configuration with runtime state.
Contains current breakpoint information and window dimensions.

## Extends

- [`ResponsiveConfig`](ResponsiveConfig.md)

## Properties

### breakpoints

> **breakpoints**: `Record`\<`Breakpoint`, [`BreakpointConfig`](BreakpointConfig.md)\>

Defined in: [packages/@mapples/style/src/types/responsive.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/responsive.ts#L23)

Map of breakpoint names to their configuration

#### Inherited from

[`ResponsiveConfig`](ResponsiveConfig.md).[`breakpoints`](ResponsiveConfig.md#breakpoints)

***

### currentBreakpoint

> **currentBreakpoint**: `string`

Defined in: [packages/@mapples/style/src/types/context.ts:29](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/context.ts#L29)

Currently active breakpoint name

***

### default

> **default**: `string`

Defined in: [packages/@mapples/style/src/types/responsive.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/responsive.ts#L21)

Default breakpoint to use when no breakpoint matches

#### Inherited from

[`ResponsiveConfig`](ResponsiveConfig.md).[`default`](ResponsiveConfig.md#default)

***

### setBreakpoint()

> **setBreakpoint**: (`breakpoint`) => `void`

Defined in: [packages/@mapples/style/src/types/context.ts:31](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/context.ts#L31)

Function to manually set the current breakpoint

#### Parameters

##### breakpoint

`string`

#### Returns

`void`

***

### windowWidth

> **windowWidth**: `number`

Defined in: [packages/@mapples/style/src/types/context.ts:27](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/types/context.ts#L27)

Current window width in pixels
