[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / useTypography

# Function: useTypography()

> **useTypography**(): `object`

Defined in: [packages/@mapples/style/src/hooks/useTypography.ts:41](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/hooks/useTypography.ts#L41)

Hook to access and manage typography configuration and styles.

## Returns

`object`

Object containing typography utilities

### typographyConfig

> **typographyConfig**: [`TypographyConfig`](../interfaces/TypographyConfig.md)

### getTypographyStyle()

> **getTypographyStyle**: (`key`) => `object`

#### Parameters

##### key

`string` = `typographyConfig.default`

#### Returns

##### color

> **color**: `ColorValue` = `typographyConfig.color`

##### fontFamily

> **fontFamily**: `string` = `typographyConfig.fontFamily`

##### alignContent?

> `optional` **alignContent**: `"center"` \| `"flex-start"` \| `"flex-end"` \| `"stretch"` \| `"space-between"` \| `"space-around"` \| `"space-evenly"`

##### alignItems?

> `optional` **alignItems**: `FlexAlignType`

##### alignSelf?

> `optional` **alignSelf**: `"auto"` \| `FlexAlignType`

##### aspectRatio?

> `optional` **aspectRatio**: `string` \| `number`

##### borderBottomWidth?

> `optional` **borderBottomWidth**: `number`

##### borderEndWidth?

> `optional` **borderEndWidth**: `number`

##### borderLeftWidth?

> `optional` **borderLeftWidth**: `number`

##### borderRightWidth?

> `optional` **borderRightWidth**: `number`

##### borderStartWidth?

> `optional` **borderStartWidth**: `number`

##### borderTopWidth?

> `optional` **borderTopWidth**: `number`

##### borderWidth?

> `optional` **borderWidth**: `number`

##### bottom?

> `optional` **bottom**: `DimensionValue`

##### boxSizing?

> `optional` **boxSizing**: `"border-box"` \| `"content-box"`

##### display?

> `optional` **display**: `"flex"` \| `"none"` \| `"contents"`

##### end?

> `optional` **end**: `DimensionValue`

##### flex?

> `optional` **flex**: `number`

##### flexBasis?

> `optional` **flexBasis**: `DimensionValue`

##### flexDirection?

> `optional` **flexDirection**: `"column"` \| `"row"` \| `"row-reverse"` \| `"column-reverse"`

##### rowGap?

> `optional` **rowGap**: `string` \| `number`

##### gap?

> `optional` **gap**: `string` \| `number`

##### columnGap?

> `optional` **columnGap**: `string` \| `number`

##### flexGrow?

> `optional` **flexGrow**: `number`

##### flexShrink?

> `optional` **flexShrink**: `number`

##### flexWrap?

> `optional` **flexWrap**: `"wrap"` \| `"nowrap"` \| `"wrap-reverse"`

##### height?

> `optional` **height**: `DimensionValue`

##### justifyContent?

> `optional` **justifyContent**: `"center"` \| `"flex-start"` \| `"flex-end"` \| `"space-between"` \| `"space-around"` \| `"space-evenly"`

##### left?

> `optional` **left**: `DimensionValue`

##### margin?

> `optional` **margin**: `DimensionValue`

##### marginBottom?

> `optional` **marginBottom**: `DimensionValue`

##### marginEnd?

> `optional` **marginEnd**: `DimensionValue`

##### marginHorizontal?

> `optional` **marginHorizontal**: `DimensionValue`

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

##### overflow?

> `optional` **overflow**: `"visible"` \| `"hidden"` \| `"scroll"`

##### padding?

> `optional` **padding**: `DimensionValue`

##### paddingBottom?

> `optional` **paddingBottom**: `DimensionValue`

##### paddingEnd?

> `optional` **paddingEnd**: `DimensionValue`

##### paddingHorizontal?

> `optional` **paddingHorizontal**: `DimensionValue`

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

##### position?

> `optional` **position**: `"absolute"` \| `"relative"` \| `"static"`

##### right?

> `optional` **right**: `DimensionValue`

##### start?

> `optional` **start**: `DimensionValue`

##### top?

> `optional` **top**: `DimensionValue`

##### width?

> `optional` **width**: `DimensionValue`

##### zIndex?

> `optional` **zIndex**: `number`

##### direction?

> `optional` **direction**: `"inherit"` \| `"ltr"` \| `"rtl"`

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

##### marginBlock?

> `optional` **marginBlock**: `DimensionValue`

Equivalent to `marginVertical`

##### marginBlockEnd?

> `optional` **marginBlockEnd**: `DimensionValue`

Equivalent to `marginBottom`

##### marginBlockStart?

> `optional` **marginBlockStart**: `DimensionValue`

Equivalent to `marginTop`

##### marginInline?

> `optional` **marginInline**: `DimensionValue`

Equivalent to `marginHorizontal`

##### marginInlineEnd?

> `optional` **marginInlineEnd**: `DimensionValue`

Equivalent to `marginEnd`

##### marginInlineStart?

> `optional` **marginInlineStart**: `DimensionValue`

Equivalent to `marginStart`

##### paddingBlock?

> `optional` **paddingBlock**: `DimensionValue`

Equivalent to `paddingVertical`

##### paddingBlockEnd?

> `optional` **paddingBlockEnd**: `DimensionValue`

Equivalent to `paddingBottom`

##### paddingBlockStart?

> `optional` **paddingBlockStart**: `DimensionValue`

Equivalent to `paddingTop`

##### paddingInline?

> `optional` **paddingInline**: `DimensionValue`

Equivalent to `paddingHorizontal`

##### paddingInlineEnd?

> `optional` **paddingInlineEnd**: `DimensionValue`

Equivalent to `paddingEnd`

##### paddingInlineStart?

> `optional` **paddingInlineStart**: `DimensionValue`

Equivalent to `paddingStart`

##### shadowColor?

> `optional` **shadowColor**: `ColorValue`

##### shadowOffset?

> `optional` **shadowOffset**: `Readonly`\<\{ `width`: `number`; `height`: `number`; \}\>

##### shadowOpacity?

> `optional` **shadowOpacity**: `AnimatableNumericValue`

##### shadowRadius?

> `optional` **shadowRadius**: `number`

##### transform?

> `optional` **transform**: `string` \| readonly (`object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object` \| `object` & `object`)[]

##### transformOrigin?

> `optional` **transformOrigin**: `string` \| (`string` \| `number`)[]

##### ~~transformMatrix?~~

> `optional` **transformMatrix**: `number`[]

###### Deprecated

Use matrix in transform prop instead.

##### ~~rotation?~~

> `optional` **rotation**: `AnimatableNumericValue`

###### Deprecated

Use rotate in transform prop instead.

##### ~~scaleX?~~

> `optional` **scaleX**: `AnimatableNumericValue`

###### Deprecated

Use scaleX in transform prop instead.

##### ~~scaleY?~~

> `optional` **scaleY**: `AnimatableNumericValue`

###### Deprecated

Use scaleY in transform prop instead.

##### ~~translateX?~~

> `optional` **translateX**: `AnimatableNumericValue`

###### Deprecated

Use translateX in transform prop instead.

##### ~~translateY?~~

> `optional` **translateY**: `AnimatableNumericValue`

###### Deprecated

Use translateY in transform prop instead.

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

##### borderLeftColor?

> `optional` **borderLeftColor**: `ColorValue`

##### borderRadius?

> `optional` **borderRadius**: `string` \| `AnimatableNumericValue`

##### borderRightColor?

> `optional` **borderRightColor**: `ColorValue`

##### borderStartColor?

> `optional` **borderStartColor**: `ColorValue`

##### borderStartEndRadius?

> `optional` **borderStartEndRadius**: `string` \| `AnimatableNumericValue`

##### borderStartStartRadius?

> `optional` **borderStartStartRadius**: `string` \| `AnimatableNumericValue`

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

##### outlineColor?

> `optional` **outlineColor**: `ColorValue`

##### outlineOffset?

> `optional` **outlineOffset**: `AnimatableNumericValue`

##### outlineStyle?

> `optional` **outlineStyle**: `"solid"` \| `"dotted"` \| `"dashed"`

##### outlineWidth?

> `optional` **outlineWidth**: `AnimatableNumericValue`

##### opacity?

> `optional` **opacity**: `AnimatableNumericValue`

##### elevation?

> `optional` **elevation**: `number`

Sets the elevation of a view, using Android's underlying
[elevation API](https://developer.android.com/training/material/shadows-clipping.html#Elevation).
This adds a drop shadow to the item and affects z-order for overlapping views.
Only supported on Android 5.0+, has no effect on earlier versions.

###### Platform

android

##### pointerEvents?

> `optional` **pointerEvents**: `"auto"` \| `"none"` \| `"box-none"` \| `"box-only"`

Controls whether the View can be the target of touch events.

##### isolation?

> `optional` **isolation**: `"auto"` \| `"isolate"`

##### cursor?

> `optional` **cursor**: `CursorValue`

##### boxShadow?

> `optional` **boxShadow**: `string` \| readonly `BoxShadowValue`[]

##### filter?

> `optional` **filter**: `string` \| readonly `FilterFunction`[]

##### mixBlendMode?

> `optional` **mixBlendMode**: `BlendMode`

##### experimental\_backgroundImage?

> `optional` **experimental\_backgroundImage**: `string` \| readonly `GradientValue`[]

##### fontVariant?

> `optional` **fontVariant**: `FontVariant`[]

##### writingDirection?

> `optional` **writingDirection**: `"auto"` \| `"ltr"` \| `"rtl"`

##### textAlignVertical?

> `optional` **textAlignVertical**: `"center"` \| `"auto"` \| `"top"` \| `"bottom"`

##### verticalAlign?

> `optional` **verticalAlign**: `"auto"` \| `"top"` \| `"bottom"` \| `"middle"`

##### includeFontPadding?

> `optional` **includeFontPadding**: `boolean`

##### fontSize?

> `optional` **fontSize**: `number`

##### fontStyle?

> `optional` **fontStyle**: `"normal"` \| `"italic"`

##### fontWeight?

> `optional` **fontWeight**: `"bold"` \| `"light"` \| `"normal"` \| `"100"` \| `"200"` \| `"300"` \| `"400"` \| `"500"` \| `"600"` \| `"700"` \| `"800"` \| `"900"` \| `100` \| `200` \| `300` \| `400` \| `500` \| `600` \| `700` \| `800` \| `900` \| `"ultralight"` \| `"thin"` \| `"medium"` \| `"regular"` \| `"semibold"` \| `"condensedBold"` \| `"condensed"` \| `"heavy"` \| `"black"`

Specifies font weight. The values 'normal' and 'bold' are supported
for most fonts. Not all fonts have a variant for each of the numeric
values, in that case the closest one is chosen.

##### letterSpacing?

> `optional` **letterSpacing**: `number`

##### lineHeight?

> `optional` **lineHeight**: `number`

##### textAlign?

> `optional` **textAlign**: `"center"` \| `"auto"` \| `"left"` \| `"right"` \| `"justify"`

##### textDecorationLine?

> `optional` **textDecorationLine**: `"none"` \| `"underline"` \| `"line-through"` \| `"underline line-through"`

##### textDecorationStyle?

> `optional` **textDecorationStyle**: `"solid"` \| `"dotted"` \| `"dashed"` \| `"double"`

##### textDecorationColor?

> `optional` **textDecorationColor**: `ColorValue`

##### textShadowColor?

> `optional` **textShadowColor**: `ColorValue`

##### textShadowOffset?

> `optional` **textShadowOffset**: `object`

###### textShadowOffset.width

> **width**: `number`

###### textShadowOffset.height

> **height**: `number`

##### textShadowRadius?

> `optional` **textShadowRadius**: `number`

##### textTransform?

> `optional` **textTransform**: `"none"` \| `"capitalize"` \| `"uppercase"` \| `"lowercase"`

##### userSelect?

> `optional` **userSelect**: `"text"` \| `"auto"` \| `"none"` \| `"contain"` \| `"all"`

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
