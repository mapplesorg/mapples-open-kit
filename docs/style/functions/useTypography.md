[**@mapples/style**](../README.md)

***

[@mapples/style](../globals.md) / useTypography

# Function: useTypography()

> **useTypography**(): `object`

Defined in: [packages/@mapples/style/src/hooks/useTypography.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/style/src/hooks/useTypography.ts#L41)

Hook to access and manage typography configuration and styles.

## Returns

`object`

Object containing typography utilities

### getTypographyStyle()

> **getTypographyStyle**: (`key`) => `object`

#### Parameters

##### key

`string` = `typographyConfig.default`

#### Returns

##### alignContent?

> `optional` **alignContent**: `"center"` \| `"flex-start"` \| `"flex-end"` \| `"stretch"` \| `"space-between"` \| `"space-around"` \| `"space-evenly"`

##### alignItems?

> `optional` **alignItems**: `FlexAlignType`

##### alignSelf?

> `optional` **alignSelf**: `"auto"` \| `FlexAlignType`

##### aspectRatio?

> `optional` **aspectRatio**: `string` \| `number`

##### backfaceVisibility?

> `optional` **backfaceVisibility**: `"visible"` \| `"hidden"`

##### backgroundColor?

> `optional` **backgroundColor**: `ColorValue`

##### borderBlockColor?

> `optional` **borderBlockColor**: `ColorValue`

##### borderBlockEndColor?

> `optional` **borderBlockEndColor**: `ColorValue`

##### borderBlockStartColor?

> `optional` **borderBlockStartColor**: `ColorValue`

##### borderBottomColor?

> `optional` **borderBottomColor**: `ColorValue`

##### borderBottomEndRadius?

> `optional` **borderBottomEndRadius**: `string` \| `AnimatableNumericValue`

##### borderBottomLeftRadius?

> `optional` **borderBottomLeftRadius**: `string` \| `AnimatableNumericValue`

##### borderBottomRightRadius?

> `optional` **borderBottomRightRadius**: `string` \| `AnimatableNumericValue`

##### borderBottomStartRadius?

> `optional` **borderBottomStartRadius**: `string` \| `AnimatableNumericValue`

##### borderBottomWidth?

> `optional` **borderBottomWidth**: `number`

##### borderColor?

> `optional` **borderColor**: `ColorValue`

##### borderCurve?

> `optional` **borderCurve**: `"circular"` \| `"continuous"`

On iOS 13+, it is possible to change the corner curve of borders.

###### Platform

ios

##### borderEndColor?

> `optional` **borderEndColor**: `ColorValue`

##### borderEndEndRadius?

> `optional` **borderEndEndRadius**: `string` \| `AnimatableNumericValue`

##### borderEndStartRadius?

> `optional` **borderEndStartRadius**: `string` \| `AnimatableNumericValue`

##### borderEndWidth?

> `optional` **borderEndWidth**: `number`

##### borderLeftColor?

> `optional` **borderLeftColor**: `ColorValue`

##### borderLeftWidth?

> `optional` **borderLeftWidth**: `number`

##### borderRadius?

> `optional` **borderRadius**: `string` \| `AnimatableNumericValue`

##### borderRightColor?

> `optional` **borderRightColor**: `ColorValue`

##### borderRightWidth?

> `optional` **borderRightWidth**: `number`

##### borderStartColor?

> `optional` **borderStartColor**: `ColorValue`

##### borderStartEndRadius?

> `optional` **borderStartEndRadius**: `string` \| `AnimatableNumericValue`

##### borderStartStartRadius?

> `optional` **borderStartStartRadius**: `string` \| `AnimatableNumericValue`

##### borderStartWidth?

> `optional` **borderStartWidth**: `number`

##### borderStyle?

> `optional` **borderStyle**: `"solid"` \| `"dotted"` \| `"dashed"`

##### borderTopColor?

> `optional` **borderTopColor**: `ColorValue`

##### borderTopEndRadius?

> `optional` **borderTopEndRadius**: `string` \| `AnimatableNumericValue`

##### borderTopLeftRadius?

> `optional` **borderTopLeftRadius**: `string` \| `AnimatableNumericValue`

##### borderTopRightRadius?

> `optional` **borderTopRightRadius**: `string` \| `AnimatableNumericValue`

##### borderTopStartRadius?

> `optional` **borderTopStartRadius**: `string` \| `AnimatableNumericValue`

##### borderTopWidth?

> `optional` **borderTopWidth**: `number`

##### borderWidth?

> `optional` **borderWidth**: `number`

##### bottom?

> `optional` **bottom**: `DimensionValue`

##### boxShadow?

> `optional` **boxShadow**: `string` \| readonly `BoxShadowValue`[]

##### boxSizing?

> `optional` **boxSizing**: `"border-box"` \| `"content-box"`

##### color

> **color**: `ColorValue` = `typographyConfig.color`

##### columnGap?

> `optional` **columnGap**: `string` \| `number`

##### cursor?

> `optional` **cursor**: `CursorValue`

##### direction?

> `optional` **direction**: `"ltr"` \| `"rtl"` \| `"inherit"`

##### display?

> `optional` **display**: `"flex"` \| `"none"` \| `"contents"`

##### elevation?

> `optional` **elevation**: `number`

Sets the elevation of a view, using Android's underlying
[elevation API](https://developer.android.com/training/material/shadows-clipping.html#Elevation).
This adds a drop shadow to the item and affects z-order for overlapping views.
Only supported on Android 5.0+, has no effect on earlier versions.

###### Platform

android

##### end?

> `optional` **end**: `DimensionValue`

##### experimental\_backgroundImage?

> `optional` **experimental\_backgroundImage**: `string` \| readonly `GradientValue`[]

##### filter?

> `optional` **filter**: `string` \| readonly `FilterFunction`[]

##### flex?

> `optional` **flex**: `number`

##### flexBasis?

> `optional` **flexBasis**: `DimensionValue`

##### flexDirection?

> `optional` **flexDirection**: `"row"` \| `"column"` \| `"row-reverse"` \| `"column-reverse"`

##### flexGrow?

> `optional` **flexGrow**: `number`

##### flexShrink?

> `optional` **flexShrink**: `number`

##### flexWrap?

> `optional` **flexWrap**: `"wrap"` \| `"nowrap"` \| `"wrap-reverse"`

##### fontFamily

> **fontFamily**: `string` = `typographyConfig.fontFamily`

##### fontSize?

> `optional` **fontSize**: `number`

##### fontStyle?

> `optional` **fontStyle**: `"normal"` \| `"italic"`

##### fontVariant?

> `optional` **fontVariant**: `FontVariant`[]

##### fontWeight?

> `optional` **fontWeight**: `"light"` \| `"bold"` \| `"normal"` \| `"100"` \| `"200"` \| `"300"` \| `"400"` \| `"500"` \| `"600"` \| `"700"` \| `"800"` \| `"900"` \| `100` \| `200` \| `300` \| `400` \| `500` \| `600` \| `700` \| `800` \| `900` \| `"ultralight"` \| `"thin"` \| `"medium"` \| `"regular"` \| `"semibold"` \| `"condensedBold"` \| `"condensed"` \| `"heavy"` \| `"black"`

Specifies font weight. The values 'normal' and 'bold' are supported
for most fonts. Not all fonts have a variant for each of the numeric
values, in that case the closest one is chosen.

##### gap?

> `optional` **gap**: `string` \| `number`

##### height?

> `optional` **height**: `DimensionValue`

##### includeFontPadding?

> `optional` **includeFontPadding**: `boolean`

##### inset?

> `optional` **inset**: `DimensionValue`

Equivalent to `top`, `bottom`, `right` and `left`

##### insetBlock?

> `optional` **insetBlock**: `DimensionValue`

Equivalent to `top`, `bottom`

##### insetBlockEnd?

> `optional` **insetBlockEnd**: `DimensionValue`

Equivalent to `bottom`

##### insetBlockStart?

> `optional` **insetBlockStart**: `DimensionValue`

Equivalent to `top`

##### insetInline?

> `optional` **insetInline**: `DimensionValue`

Equivalent to `right` and `left`

##### insetInlineEnd?

> `optional` **insetInlineEnd**: `DimensionValue`

Equivalent to `right` or `left`

##### insetInlineStart?

> `optional` **insetInlineStart**: `DimensionValue`

Equivalent to `right` or `left`

##### isolation?

> `optional` **isolation**: `"auto"` \| `"isolate"`

##### justifyContent?

> `optional` **justifyContent**: `"center"` \| `"flex-start"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` \| `"space-evenly"`

##### left?

> `optional` **left**: `DimensionValue`

##### letterSpacing?

> `optional` **letterSpacing**: `number`

##### lineHeight?

> `optional` **lineHeight**: `number`

##### margin?

> `optional` **margin**: `DimensionValue`

##### marginBlock?

> `optional` **marginBlock**: `DimensionValue`

Equivalent to `marginVertical`

##### marginBlockEnd?

> `optional` **marginBlockEnd**: `DimensionValue`

Equivalent to `marginBottom`

##### marginBlockStart?

> `optional` **marginBlockStart**: `DimensionValue`

Equivalent to `marginTop`

##### marginBottom?

> `optional` **marginBottom**: `DimensionValue`

##### marginEnd?

> `optional` **marginEnd**: `DimensionValue`

##### marginHorizontal?

> `optional` **marginHorizontal**: `DimensionValue`

##### marginInline?

> `optional` **marginInline**: `DimensionValue`

Equivalent to `marginHorizontal`

##### marginInlineEnd?

> `optional` **marginInlineEnd**: `DimensionValue`

Equivalent to `marginEnd`

##### marginInlineStart?

> `optional` **marginInlineStart**: `DimensionValue`

Equivalent to `marginStart`

##### marginLeft?

> `optional` **marginLeft**: `DimensionValue`

##### marginRight?

> `optional` **marginRight**: `DimensionValue`

##### marginStart?

> `optional` **marginStart**: `DimensionValue`

##### marginTop?

> `optional` **marginTop**: `DimensionValue`

##### marginVertical?

> `optional` **marginVertical**: `DimensionValue`

##### maxHeight?

> `optional` **maxHeight**: `DimensionValue`

##### maxWidth?

> `optional` **maxWidth**: `DimensionValue`

##### minHeight?

> `optional` **minHeight**: `DimensionValue`

##### minWidth?

> `optional` **minWidth**: `DimensionValue`

##### mixBlendMode?

> `optional` **mixBlendMode**: `BlendMode`

##### opacity?

> `optional` **opacity**: `AnimatableNumericValue`

##### outlineColor?

> `optional` **outlineColor**: `ColorValue`

##### outlineOffset?

> `optional` **outlineOffset**: `AnimatableNumericValue`

##### outlineStyle?

> `optional` **outlineStyle**: `"solid"` \| `"dotted"` \| `"dashed"`

##### outlineWidth?

> `optional` **outlineWidth**: `AnimatableNumericValue`

##### overflow?

> `optional` **overflow**: `"visible"` \| `"hidden"` \| `"scroll"`

##### padding?

> `optional` **padding**: `DimensionValue`

##### paddingBlock?

> `optional` **paddingBlock**: `DimensionValue`

Equivalent to `paddingVertical`

##### paddingBlockEnd?

> `optional` **paddingBlockEnd**: `DimensionValue`

Equivalent to `paddingBottom`

##### paddingBlockStart?

> `optional` **paddingBlockStart**: `DimensionValue`

Equivalent to `paddingTop`

##### paddingBottom?

> `optional` **paddingBottom**: `DimensionValue`

##### paddingEnd?

> `optional` **paddingEnd**: `DimensionValue`

##### paddingHorizontal?

> `optional` **paddingHorizontal**: `DimensionValue`

##### paddingInline?

> `optional` **paddingInline**: `DimensionValue`

Equivalent to `paddingHorizontal`

##### paddingInlineEnd?

> `optional` **paddingInlineEnd**: `DimensionValue`

Equivalent to `paddingEnd`

##### paddingInlineStart?

> `optional` **paddingInlineStart**: `DimensionValue`

Equivalent to `paddingStart`

##### paddingLeft?

> `optional` **paddingLeft**: `DimensionValue`

##### paddingRight?

> `optional` **paddingRight**: `DimensionValue`

##### paddingStart?

> `optional` **paddingStart**: `DimensionValue`

##### paddingTop?

> `optional` **paddingTop**: `DimensionValue`

##### paddingVertical?

> `optional` **paddingVertical**: `DimensionValue`

##### pointerEvents?

> `optional` **pointerEvents**: `"auto"` \| `"none"` \| `"box-none"` \| `"box-only"`

Controls whether the View can be the target of touch events.

##### position?

> `optional` **position**: `"absolute"` \| `"relative"` \| `"static"`

##### right?

> `optional` **right**: `DimensionValue`

##### ~~rotation?~~

> `optional` **rotation**: `AnimatableNumericValue`

###### Deprecated

Use rotate in transform prop instead.

##### rowGap?

> `optional` **rowGap**: `string` \| `number`

##### ~~scaleX?~~

> `optional` **scaleX**: `AnimatableNumericValue`

###### Deprecated

Use scaleX in transform prop instead.

##### ~~scaleY?~~

> `optional` **scaleY**: `AnimatableNumericValue`

###### Deprecated

Use scaleY in transform prop instead.

##### shadowColor?

> `optional` **shadowColor**: `ColorValue`

##### shadowOffset?

> `optional` **shadowOffset**: `Readonly`\<\{ `height`: `number`; `width`: `number`; \}\>

##### shadowOpacity?

> `optional` **shadowOpacity**: `AnimatableNumericValue`

##### shadowRadius?

> `optional` **shadowRadius**: `number`

##### start?

> `optional` **start**: `DimensionValue`

##### textAlign?

> `optional` **textAlign**: `"auto"` \| `"left"` \| `"right"` \| `"center"` \| `"justify"`

##### textAlignVertical?

> `optional` **textAlignVertical**: `"auto"` \| `"top"` \| `"bottom"` \| `"center"`

##### textDecorationColor?

> `optional` **textDecorationColor**: `ColorValue`

##### textDecorationLine?

> `optional` **textDecorationLine**: `"none"` \| `"underline"` \| `"line-through"` \| `"underline line-through"`

##### textDecorationStyle?

> `optional` **textDecorationStyle**: `"solid"` \| `"double"` \| `"dotted"` \| `"dashed"`

##### textShadowColor?

> `optional` **textShadowColor**: `ColorValue`

##### textShadowOffset?

> `optional` **textShadowOffset**: `object`

###### textShadowOffset.height

> **height**: `number`

###### textShadowOffset.width

> **width**: `number`

##### textShadowRadius?

> `optional` **textShadowRadius**: `number`

##### textTransform?

> `optional` **textTransform**: `"none"` \| `"capitalize"` \| `"uppercase"` \| `"lowercase"`

##### top?

> `optional` **top**: `DimensionValue`

##### transform?

> `optional` **transform**: `string` \| readonly (`object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object`)[]

##### ~~transformMatrix?~~

> `optional` **transformMatrix**: `number`[]

###### Deprecated

Use matrix in transform prop instead.

##### transformOrigin?

> `optional` **transformOrigin**: `string` \| (`string` \| `number`)[]

##### ~~translateX?~~

> `optional` **translateX**: `AnimatableNumericValue`

###### Deprecated

Use translateX in transform prop instead.

##### ~~translateY?~~

> `optional` **translateY**: `AnimatableNumericValue`

###### Deprecated

Use translateY in transform prop instead.

##### userSelect?

> `optional` **userSelect**: `"auto"` \| `"text"` \| `"none"` \| `"contain"` \| `"all"`

##### verticalAlign?

> `optional` **verticalAlign**: `"auto"` \| `"top"` \| `"bottom"` \| `"middle"`

##### width?

> `optional` **width**: `DimensionValue`

##### writingDirection?

> `optional` **writingDirection**: `"auto"` \| `"ltr"` \| `"rtl"`

##### zIndex?

> `optional` **zIndex**: `number`

### typographyConfig

> **typographyConfig**: [`TypographyConfig`](../interfaces/TypographyConfig.md)

## Examples

```tsx
const MyComponent = () => {
  const { getTypographyStyle } = useTypography();

  return (
    <Text style={getTypographyStyle('heading1')}>
      Large Heading
    </Text>
  );
};
```

```tsx
const MyComponent = () => {
  const { typographyConfig, getTypographyStyle } = useTypography();

  return (
    <View>
      <Text style={getTypographyStyle('heading1')}>Title</Text>
      <Text style={getTypographyStyle('body')}>Body text</Text>
      <Text style={getTypographyStyle('caption')}>Caption</Text>
    </View>
  );
};
```
