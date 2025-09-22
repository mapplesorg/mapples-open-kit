[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [style/src](../README.md) / TypographyProps

# Interface: TypographyProps

Defined in: [packages/@mapples/style/src/components/Typography.tsx:14](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L14)

Props for the Typography component.

## Extends

- `Omit`\<`TextProps`, `"style"`\>

## Properties

### variant?

> `optional` **variant**: `string`

Defined in: [packages/@mapples/style/src/components/Typography.tsx:16](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L16)

The typography variant to apply (e.g., 'heading1', 'body', 'caption')

***

### color?

> `optional` **color**: `string` \| `false`

Defined in: [packages/@mapples/style/src/components/Typography.tsx:18](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L18)

Custom color to override the typography color, or false to disable color

***

### style?

> `optional` **style**: [`StyledProp`](../type-aliases/StyledProp.md)\<`TextStyle`\>

Defined in: [packages/@mapples/style/src/components/Typography.tsx:20](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L20)

Additional styles to apply to the text

***

### styled?

> `optional` **styled**: [`StyledProps`](../type-aliases/StyledProps.md)\<`TextProps`\>

Defined in: [packages/@mapples/style/src/components/Typography.tsx:22](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L22)

Styled props for advanced styling with theme and responsive support

***

### selectable?

> `optional` **selectable**: `boolean`

Defined in: [packages/@mapples/style/src/components/Typography.tsx:24](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/style/src/components/Typography.tsx#L24)

Whether the text should be selectable by the user

#### Overrides

`Omit.selectable`

***

### accessible?

> `optional` **accessible**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:22

When true, indicates that the view is an accessibility element.
By default, all the touchable elements are accessible.

#### Inherited from

`Omit.accessible`

***

### accessibilityActions?

> `optional` **accessibilityActions**: readonly `Readonly`\<\{ `name`: `string`; `label?`: `string`; \}\>[]

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:27

Provides an array of custom actions available for accessibility.

#### Inherited from

`Omit.accessibilityActions`

***

### accessibilityLabel?

> `optional` **accessibilityLabel**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:33

Overrides the text that's read by the screen reader when the user interacts with the element. By default, the
label is constructed by traversing all the children and accumulating all the Text nodes separated by space.

#### Inherited from

`Omit.accessibilityLabel`

***

### aria-label?

> `optional` **aria-label**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:39

Alias for accessibilityLabel  https://reactnative.dev/docs/view#accessibilitylabel
https://github.com/facebook/react-native/issues/34424

#### Inherited from

`Omit.aria-label`

***

### accessibilityRole?

> `optional` **accessibilityRole**: `AccessibilityRole`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:44

Accessibility Role tells a person using either VoiceOver on iOS or TalkBack on Android the type of element that is focused on.

#### Inherited from

`Omit.accessibilityRole`

***

### accessibilityState?

> `optional` **accessibilityState**: `AccessibilityState`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:48

Accessibility State tells a person using either VoiceOver on iOS or TalkBack on Android the state of the element currently focused on.

#### Inherited from

`Omit.accessibilityState`

***

### aria-busy?

> `optional` **aria-busy**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:55

alias for accessibilityState

see https://reactnative.dev/docs/accessibility#accessibilitystate

#### Inherited from

`Omit.aria-busy`

***

### aria-checked?

> `optional` **aria-checked**: `boolean` \| `"mixed"`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:56

#### Inherited from

`Omit.aria-checked`

***

### aria-disabled?

> `optional` **aria-disabled**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:57

#### Inherited from

`Omit.aria-disabled`

***

### aria-expanded?

> `optional` **aria-expanded**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:58

#### Inherited from

`Omit.aria-expanded`

***

### aria-selected?

> `optional` **aria-selected**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:59

#### Inherited from

`Omit.aria-selected`

***

### accessibilityHint?

> `optional` **accessibilityHint**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:64

An accessibility hint helps users understand what will happen when they perform an action on the accessibility element when that result is not obvious from the accessibility label.

#### Inherited from

`Omit.accessibilityHint`

***

### accessibilityValue?

> `optional` **accessibilityValue**: `AccessibilityValue`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:69

Represents the current value of a component. It can be a textual description of a component's value, or for range-based components, such as sliders and progress bars,
it contains range information (minimum, current, and maximum).

#### Inherited from

`Omit.accessibilityValue`

***

### aria-valuemax?

> `optional` **aria-valuemax**: `number`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:71

#### Inherited from

`Omit.aria-valuemax`

***

### aria-valuemin?

> `optional` **aria-valuemin**: `number`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:72

#### Inherited from

`Omit.aria-valuemin`

***

### aria-valuenow?

> `optional` **aria-valuenow**: `number`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:73

#### Inherited from

`Omit.aria-valuenow`

***

### aria-valuetext?

> `optional` **aria-valuetext**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:74

#### Inherited from

`Omit.aria-valuetext`

***

### onAccessibilityAction()?

> `optional` **onAccessibilityAction**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:78

When `accessible` is true, the system will try to invoke this function when the user performs an accessibility custom action.

#### Parameters

##### event

`AccessibilityActionEvent`

#### Returns

`void`

#### Inherited from

`Omit.onAccessibilityAction`

***

### importantForAccessibility?

> `optional` **importantForAccessibility**: `"auto"` \| `"yes"` \| `"no"` \| `"no-hide-descendants"`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:85

[Android] Controlling if a view fires accessibility events and if it is reported to accessibility services.

#### Inherited from

`Omit.importantForAccessibility`

***

### aria-hidden?

> `optional` **aria-hidden**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:93

A value indicating whether the accessibility elements contained within
this accessibility element are hidden.

#### Inherited from

`Omit.aria-hidden`

***

### aria-modal?

> `optional` **aria-modal**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:95

#### Inherited from

`Omit.aria-modal`

***

### role?

> `optional` **role**: `Role`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:100

Indicates to accessibility services to treat UI component like a specific role.

#### Inherited from

`Omit.role`

***

### accessibilityLabelledBy?

> `optional` **accessibilityLabelledBy**: `string` \| `string`[]

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:227

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

#### Platform

android

#### Inherited from

`Omit.accessibilityLabelledBy`

***

### aria-labelledby?

> `optional` **aria-labelledby**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:235

Identifies the element that labels the element it is applied to. When the assistive technology focuses on the component with this props,
the text is read aloud. The value should should match the nativeID of the related element.

#### Platform

android

#### Inherited from

`Omit.aria-labelledby`

***

### accessibilityLiveRegion?

> `optional` **accessibilityLiveRegion**: `"none"` \| `"polite"` \| `"assertive"`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:245

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

#### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

#### Inherited from

`Omit.accessibilityLiveRegion`

***

### aria-live?

> `optional` **aria-live**: `"off"` \| `"polite"` \| `"assertive"`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:255

Indicates to accessibility services whether the user should be notified
when this view changes. Works for Android API >= 19 only.

#### Platform

android

See https://reactnative.dev/docs/view#accessibilityliveregion

#### Inherited from

`Omit.aria-live`

***

### screenReaderFocusable?

> `optional` **screenReaderFocusable**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:282

Enables the view to be screen reader focusable, not keyboard focusable.

#### Platform

android

#### Inherited from

`Omit.screenReaderFocusable`

***

### accessibilityElementsHidden?

> `optional` **accessibilityElementsHidden**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:291

A Boolean value indicating whether the accessibility elements contained within this accessibility element
are hidden to the screen reader.

#### Platform

ios

#### Inherited from

`Omit.accessibilityElementsHidden`

***

### accessibilityViewIsModal?

> `optional` **accessibilityViewIsModal**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:297

A Boolean value indicating whether VoiceOver should ignore the elements within views that are siblings of the receiver.

#### Platform

ios

#### Inherited from

`Omit.accessibilityViewIsModal`

***

### onAccessibilityEscape()?

> `optional` **onAccessibilityEscape**: () => `void`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:303

When accessible is true, the system will invoke this function when the user performs the escape gesture (scrub with two fingers).

#### Returns

`void`

#### Platform

ios

#### Inherited from

`Omit.onAccessibilityEscape`

***

### onAccessibilityTap()?

> `optional` **onAccessibilityTap**: () => `void`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:309

When `accessible` is true, the system will try to invoke this function when the user performs accessibility tap gesture.

#### Returns

`void`

#### Platform

ios

#### Inherited from

`Omit.onAccessibilityTap`

***

### onMagicTap()?

> `optional` **onMagicTap**: () => `void`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:315

When accessible is true, the system will invoke this function when the user performs the magic tap gesture.

#### Returns

`void`

#### Platform

ios

#### Inherited from

`Omit.onMagicTap`

***

### accessibilityIgnoresInvertColors?

> `optional` **accessibilityIgnoresInvertColors**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:321

https://reactnative.dev/docs/accessibility#accessibilityignoresinvertcolorsios

#### Platform

ios

#### Inherited from

`Omit.accessibilityIgnoresInvertColors`

***

### accessibilityLanguage?

> `optional` **accessibilityLanguage**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:328

By using the accessibilityLanguage property, the screen reader will understand which language to use while reading the element's label, value and hint. The provided string value must follow the BCP 47 specification (https://www.rfc-editor.org/info/bcp47).
https://reactnative.dev/docs/accessibility#accessibilitylanguage-ios

#### Platform

ios

#### Inherited from

`Omit.accessibilityLanguage`

***

### accessibilityShowsLargeContentViewer?

> `optional` **accessibilityShowsLargeContentViewer**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:336

A Boolean value that indicates whether or not to show the item in the large content viewer.
Available on iOS 13.0+
https://reactnative.dev/docs/accessibility#accessibilityshowslargecontentviewer

#### Platform

ios

#### Inherited from

`Omit.accessibilityShowsLargeContentViewer`

***

### accessibilityLargeContentTitle?

> `optional` **accessibilityLargeContentTitle**: `string`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:343

When `accessibilityShowsLargeContentViewer` is set, this string will be used as title for the large content viewer.
https://reactnative.dev/docs/accessibility#accessibilitylargecontenttitle

#### Platform

ios

#### Inherited from

`Omit.accessibilityLargeContentTitle`

***

### accessibilityRespondsToUserInteraction?

> `optional` **accessibilityRespondsToUserInteraction**: `boolean`

Defined in: node\_modules/react-native/Libraries/Components/View/ViewAccessibility.d.ts:351

Blocks the user from interacting with the component through keyboard while still allowing
screen reader to interact with it if this View is still accessible.

#### Platform

ios

#### Inherited from

`Omit.accessibilityRespondsToUserInteraction`

***

### adjustsFontSizeToFit?

> `optional` **adjustsFontSizeToFit**: `boolean`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:26

Specifies whether font should be scaled down automatically to fit given style constraints.

#### Inherited from

`Omit.adjustsFontSizeToFit`

***

### dynamicTypeRamp?

> `optional` **dynamicTypeRamp**: `"body"` \| `"caption2"` \| `"caption1"` \| `"footnote"` \| `"subheadline"` \| `"callout"` \| `"headline"` \| `"title3"` \| `"title2"` \| `"title1"` \| `"largeTitle"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:31

The Dynamic Type scale ramp to apply to this element on iOS.

#### Inherited from

`Omit.dynamicTypeRamp`

***

### suppressHighlighting?

> `optional` **suppressHighlighting**: `boolean`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:49

When `true`, no visual change is made when text is pressed down. By
default, a gray oval highlights the text on press down.

#### Inherited from

`Omit.suppressHighlighting`

***

### lineBreakStrategyIOS?

> `optional` **lineBreakStrategyIOS**: `"none"` \| `"standard"` \| `"hangul-word"` \| `"push-out"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:54

Set line break strategy on iOS.

#### Inherited from

`Omit.lineBreakStrategyIOS`

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:66

Specifies the disabled state of the text view for testing purposes.

#### Inherited from

`Omit.disabled`

***

### selectionColor?

> `optional` **selectionColor**: `ColorValue`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:76

The highlight color of the text.

#### Inherited from

`Omit.selectionColor`

***

### textBreakStrategy?

> `optional` **textBreakStrategy**: `"simple"` \| `"highQuality"` \| `"balanced"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:82

Set text break strategy on Android API Level 23+
default is `highQuality`.

#### Inherited from

`Omit.textBreakStrategy`

***

### dataDetectorType?

> `optional` **dataDetectorType**: `null` \| `"link"` \| `"none"` \| `"all"` \| `"phoneNumber"` \| `"email"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:88

Determines the types of data converted to clickable URLs in the text element.
By default no data types are detected.

#### Inherited from

`Omit.dataDetectorType`

***

### android\_hyphenationFrequency?

> `optional` **android\_hyphenationFrequency**: `"none"` \| `"normal"` \| `"full"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:100

Hyphenation strategy

#### Inherited from

`Omit.android_hyphenationFrequency`

***

### allowFontScaling?

> `optional` **allowFontScaling**: `boolean`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:112

Specifies whether fonts should scale to respect Text Size accessibility settings.
The default is `true`.

#### Inherited from

`Omit.allowFontScaling`

***

### children?

> `optional` **children**: `ReactNode`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:114

#### Inherited from

`Omit.children`

***

### ellipsizeMode?

> `optional` **ellipsizeMode**: `"head"` \| `"middle"` \| `"tail"` \| `"clip"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:133

This can be one of the following values:

- `head` - The line is displayed so that the end fits in the container and the missing text
at the beginning of the line is indicated by an ellipsis glyph. e.g., "...wxyz"
- `middle` - The line is displayed so that the beginning and end fit in the container and the
missing text in the middle is indicated by an ellipsis glyph. "ab...yz"
- `tail` - The line is displayed so that the beginning fits in the container and the
missing text at the end of the line is indicated by an ellipsis glyph. e.g., "abcd..."
- `clip` - Lines are not drawn past the edge of the text container.

The default is `tail`.

`numberOfLines` must be set in conjunction with this prop.

> `clip` is working only for iOS

#### Inherited from

`Omit.ellipsizeMode`

***

### id?

> `optional` **id**: `string`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:138

Used to reference react managed views from native code.

#### Inherited from

`Omit.id`

***

### lineBreakMode?

> `optional` **lineBreakMode**: `"head"` \| `"middle"` \| `"tail"` \| `"clip"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:144

Line Break mode. Works only with numberOfLines.
clip is working only for iOS

#### Inherited from

`Omit.lineBreakMode`

***

### numberOfLines?

> `optional` **numberOfLines**: `number`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:153

Used to truncate the text with an ellipsis after computing the text
layout, including line wrapping, such that the total number of lines
does not exceed this number.

This prop is commonly used with `ellipsizeMode`.

#### Inherited from

`Omit.numberOfLines`

***

### onLayout()?

> `optional` **onLayout**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:160

Invoked on mount and layout changes with

{nativeEvent: { layout: {x, y, width, height}}}.

#### Parameters

##### event

`LayoutChangeEvent`

#### Returns

`void`

#### Inherited from

`Omit.onLayout`

***

### onTextLayout()?

> `optional` **onTextLayout**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:165

Invoked on Text layout

#### Parameters

##### event

`TextLayoutEvent`

#### Returns

`void`

#### Inherited from

`Omit.onTextLayout`

***

### onPress()?

> `optional` **onPress**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:171

This function is called on press.
Text intrinsically supports press handling with a default highlight state (which can be disabled with suppressHighlighting).

#### Parameters

##### event

`GestureResponderEvent`

#### Returns

`void`

#### Inherited from

`Omit.onPress`

***

### onPressIn()?

> `optional` **onPressIn**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:173

#### Parameters

##### event

`GestureResponderEvent`

#### Returns

`void`

#### Inherited from

`Omit.onPressIn`

***

### onPressOut()?

> `optional` **onPressOut**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:174

#### Parameters

##### event

`GestureResponderEvent`

#### Returns

`void`

#### Inherited from

`Omit.onPressOut`

***

### onLongPress()?

> `optional` **onLongPress**: (`event`) => `void`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:180

This function is called on long press.
e.g., `onLongPress={this.increaseSize}>`

#### Parameters

##### event

`GestureResponderEvent`

#### Returns

`void`

#### Inherited from

`Omit.onLongPress`

***

### testID?

> `optional` **testID**: `string`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:190

Used to locate this view in end-to-end tests.

#### Inherited from

`Omit.testID`

***

### nativeID?

> `optional` **nativeID**: `string`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:195

Used to reference react managed views from native code.

#### Inherited from

`Omit.nativeID`

***

### maxFontSizeMultiplier?

> `optional` **maxFontSizeMultiplier**: `null` \| `number`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:203

Specifies largest possible scale a font can reach when allowFontScaling is enabled. Possible values:
- null/undefined (default): inherit from the parent node or the global default (0)
- 0: no max, ignore parent/global default
- >= 1: sets the maxFontSizeMultiplier of this node to this value

#### Inherited from

`Omit.maxFontSizeMultiplier`

***

### minimumFontScale?

> `optional` **minimumFontScale**: `number`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:208

Specifies smallest possible scale a font can reach when adjustsFontSizeToFit is enabled. (values 0.01-1.0).

#### Inherited from

`Omit.minimumFontScale`

***

### pointerEvents?

> `optional` **pointerEvents**: `"auto"` \| `"none"` \| `"box-none"` \| `"box-only"`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:213

Controls how touch events are handled. Similar to `View`'s `pointerEvents`.

#### Inherited from

`Omit.pointerEvents`

***

### pressRetentionOffset?

> `optional` **pressRetentionOffset**: `object`

Defined in: node\_modules/react-native/Libraries/Text/Text.d.ts:218

Defines how far your touch may move off of the button, before deactivating the button.

#### top

> **top**: `number`

#### left

> **left**: `number`

#### bottom

> **bottom**: `number`

#### right

> **right**: `number`

#### Inherited from

`Omit.pressRetentionOffset`
