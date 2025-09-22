[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/form](../README.md) / FormProps

# Interface: FormProps\<T\>

Defined in: [types/index.ts:60](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L60)

Props for the Form component.

## Type Parameters

### T

`T` *extends* `object`

The type of the form data object

## Properties

### initialValues

> **initialValues**: `T`

Defined in: [types/index.ts:62](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L62)

Initial values for the form fields

***

### validationSchema?

> `optional` **validationSchema**: `ObjectSchema`\<`T`, `AnyObject`, `any`, `""`\>

Defined in: [types/index.ts:64](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L64)

Optional Yup validation schema for form validation

***

### onSubmit()?

> `optional` **onSubmit**: (`value`) => `void` \| `Promise`\<`void`\>

Defined in: [types/index.ts:66](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L66)

Callback function called when the form is successfully submitted

#### Parameters

##### value

`T`

#### Returns

`void` \| `Promise`\<`void`\>

***

### ref?

> `optional` **ref**: `RefObject`\<`null` \| [`FormState`](../classes/FormState.md)\<`T`\>\>

Defined in: [types/index.ts:68](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L68)

Optional ref to access the FormState instance directly

***

### historyItems?

> `optional` **historyItems**: `number`

Defined in: [types/index.ts:70](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L70)

Number of history items to keep for undo/redo functionality (0 to disable)

***

### historyItemThrottle?

> `optional` **historyItemThrottle**: `number`

Defined in: [types/index.ts:72](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L72)

Throttle for saving history items (every Nth change)

***

### filterHistoryKeys?

> `optional` **filterHistoryKeys**: `string`[]

Defined in: [types/index.ts:74](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L74)

Array of field paths to exclude from history tracking

***

### onChange()?

> `optional` **onChange**: (`value`) => `void`

Defined in: [types/index.ts:76](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/form/src/types/index.ts#L76)

Callback function called whenever form values change

#### Parameters

##### value

`T`

#### Returns

`void`
