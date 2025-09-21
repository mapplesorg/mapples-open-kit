[**@mapples/form**](../README.md)

***

[@mapples/form](../globals.md) / FormContextType

# Interface: FormContextType\<T\>

Defined in: [types/index.ts:38](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L38)

Context type that provides form state and methods to child components.

## Type Parameters

### T

`T` *extends* `object`

The type of the form data object

## Properties

### form

> **form**: `null` \| [`FormState`](../classes/FormState.md)\<`T`\>

Defined in: [types/index.ts:40](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L40)

The form state instance containing all form data and methods

***

### submitForm()

> **submitForm**: () => `void`

Defined in: [types/index.ts:44](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L44)

Function to submit the form, triggering validation and onSubmit callback

#### Returns

`void`

***

### submitting

> **submitting**: `boolean`

Defined in: [types/index.ts:46](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L46)

Boolean indicating if the form is currently being submitted

***

### touch()

> **touch**: (`fieldName`) => `void`

Defined in: [types/index.ts:52](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L52)

Function to mark a specific field as touched

#### Parameters

##### fieldName

`string`

#### Returns

`void`

***

### touched

> **touched**: `Record`\<keyof `T`, `boolean`\>

Defined in: [types/index.ts:42](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L42)

Object tracking which fields have been touched by the user

***

### validate()

> **validate**: () => `void`

Defined in: [types/index.ts:50](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L50)

Function to validate the form without submitting

#### Returns

`void`

***

### validationErrors

> **validationErrors**: `null` \| `Record`\<`string`, `ValidationError`[]\>

Defined in: [types/index.ts:48](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/form/src/types/index.ts#L48)

Validation errors organized by field path
