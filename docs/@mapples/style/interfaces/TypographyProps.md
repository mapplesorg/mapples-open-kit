[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/style](../README.md) / TypographyProps

# Interface: TypographyProps

Defined in: [components/Typography.tsx:14](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L14)

Props for the Typography component.

## Extends

- `Omit`\<`TextProps`, `"style"`\>

## Properties

### variant?

> `optional` **variant**: `string`

Defined in: [components/Typography.tsx:16](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L16)

The typography variant to apply (e.g., 'heading1', 'body', 'caption')

***

### color?

> `optional` **color**: `string` \| `false`

Defined in: [components/Typography.tsx:18](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L18)

Custom color to override the typography color, or false to disable color

***

### style?

> `optional` **style**: [`StyledProp`](../type-aliases/StyledProp.md)\<`TextStyle`\>

Defined in: [components/Typography.tsx:20](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L20)

Additional styles to apply to the text

***

### styled?

> `optional` **styled**: [`StyledProps`](../type-aliases/StyledProps.md)\<`TextProps`\>

Defined in: [components/Typography.tsx:22](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L22)

Styled props for advanced styling with theme and responsive support

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [components/Typography.tsx:24](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/style/src/components/Typography.tsx#L24)

Whether the text should be selectable by the user

#### Overrides

`Omit.selectable`
