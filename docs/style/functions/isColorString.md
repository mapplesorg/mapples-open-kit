[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / isColorString

# Function: isColorString()

> **isColorString**(`color`): color is \`rgb($\{number\}, $\{number\}, $\{number\})\` \| \`rgba($\{number\}, $\{number\}, $\{number\}, $\{number\})\` \| \`#$\{string\}\`

Defined in: [packages/@mapples/style/src/utils/system.ts:139](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/utils/system.ts#L139)

Type guard to check if a value is a valid color string (RGB, RGBA, or HEX).

## Parameters

### color

The value to check

[`ThemeMap`](../interfaces/ThemeMap.md) | `ColorValue`

## Returns

color is \`rgb($\{number\}, $\{number\}, $\{number\})\` \| \`rgba($\{number\}, $\{number\}, $\{number\}, $\{number\})\` \| \`#$\{string\}\`

True if the value is a valid color string

## Example

```tsx
isColorString('#FF0000'); // true
isColorString('rgb(255, 0, 0)'); // true
isColorString('rgba(255, 0, 0, 0.5)'); // true
isColorString('red'); // false
```
