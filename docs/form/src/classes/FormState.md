[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / FormState

# Class: FormState\<T\>

Defined in: [packages/@mapples/form/src/state/index.ts:18](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L18)

FormState manages the state of a form including values, validation, history, and subscriptions.
It provides methods to get/set values, validate data, manage history for undo/redo functionality,
and subscribe to value changes.

## Type Parameters

### T

`T` *extends* `object`

The type of the form data object

## Constructors

### Constructor

> **new FormState**\<`T`\>(`initialValues`, `validationSchema?`, `historyItems?`, `historyItemThrottle?`, `filterHistoryKeys?`): `FormState`\<`T`\>

Defined in: [packages/@mapples/form/src/state/index.ts:42](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L42)

Creates a new FormState instance.

#### Parameters

##### initialValues

`T`

The initial values for the form

##### validationSchema?

`ObjectSchema`\<`T`, `AnyObject`, `any`, `""`\>

Optional Yup validation schema

##### historyItems?

`number` = `0`

Number of history items to keep for undo/redo (0 to disable)

##### historyItemThrottle?

`number` = `5`

Throttle for saving history items (every Nth change)

##### filterHistoryKeys?

`string`[] = `[]`

Array of field paths to exclude from history tracking

#### Returns

`FormState`\<`T`\>

## Methods

### getValues()

> **getValues**(): `T`

Defined in: [packages/@mapples/form/src/state/index.ts:66](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L66)

Gets a deep copy of all form values.

#### Returns

`T`

A deep copy of the current form values

***

### setErrors()

> **setErrors**(`errors`): `void`

Defined in: [packages/@mapples/form/src/state/index.ts:75](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L75)

Sets validation errors for the form.

#### Parameters

##### errors

`Record`\<`string`, `ValidationError`[]\>

Validation errors organized by field path

#### Returns

`void`

***

### getErrors()

> **getErrors**(): `null` \| `Record`\<`string`, `ValidationError`[]\>

Defined in: [packages/@mapples/form/src/state/index.ts:84](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L84)

Gets the current validation errors.

#### Returns

`null` \| `Record`\<`string`, `ValidationError`[]\>

Current validation errors or null if no errors

***

### setValues()

> **setValues**(`values`): `void`

Defined in: [packages/@mapples/form/src/state/index.ts:93](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L93)

Sets all form values and triggers subscriptions.

#### Parameters

##### values

`T`

New values to set for the form

#### Returns

`void`

***

### setValue()

> **setValue**\<`V`\>(`path`, `value?`): `void`

Defined in: [packages/@mapples/form/src/state/index.ts:112](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L112)

Sets a value at a specific path and triggers subscriptions.

#### Type Parameters

##### V

`V`

The type of value being set

#### Parameters

##### path

`string`

Dot notation path to the field (e.g., 'user.name')

##### value?

`V`

The value to set at the specified path

#### Returns

`void`

***

### subscribeOnChange()

> **subscribeOnChange**\<`V`\>(`cb`, `path?`): () => `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:139](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L139)

Subscribes to form value changes.

#### Type Parameters

##### V

`V`

The type of value being subscribed to

#### Parameters

##### cb

[`SubscriptionCallBack`](../type-aliases/SubscriptionCallBack.md)\<`V`\>

Callback function to execute when values change

##### path?

`string`

Optional path to subscribe to a specific field

#### Returns

Unsubscribe function to remove the subscription

> (): `boolean`

##### Returns

`boolean`

***

### subscribeOnHistoryChange()

> **subscribeOnHistoryChange**(`cb`): () => `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:156](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L156)

Subscribes to form history changes (undo/redo operations).

#### Parameters

##### cb

() => `void`

Callback function to execute when history changes

#### Returns

Unsubscribe function to remove the subscription

> (): `boolean`

##### Returns

`boolean`

***

### getValue()

> **getValue**\<`V`\>(`path?`): `V`

Defined in: [packages/@mapples/form/src/state/index.ts:171](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L171)

Gets a value at a specific path or all values if no path is provided.

#### Type Parameters

##### V

`V`

The type of value to return

#### Parameters

##### path?

`string`

Optional dot notation path to the field

#### Returns

`V`

The value at the specified path or all form values

***

### validate()

> **validate**(): `Promise`\<`void`\>

Defined in: [packages/@mapples/form/src/state/index.ts:180](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L180)

Validates the form using the provided validation schema.

#### Returns

`Promise`\<`void`\>

#### Throws

Throws validation errors if validation fails

***

### prev()

> **prev**(): `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:225](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L225)

Moves to the previous state in the form history (undo operation).

#### Returns

`boolean`

True if the operation was successful, false if no previous state exists

***

### next()

> **next**(): `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:239](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L239)

Moves to the next state in the form history (redo operation).

#### Returns

`boolean`

True if the operation was successful, false if no next state exists

***

### canPrev()

> **canPrev**(): `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:253](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L253)

Checks if there is a previous state available for undo operation.

#### Returns

`boolean`

True if undo operation is possible

***

### canNext()

> **canNext**(): `boolean`

Defined in: [packages/@mapples/form/src/state/index.ts:262](https://github.com/mapplesorg/mapples-open-kit/blob/940ecb2c1a584fde5076b098ca4233efd1dc453b/packages/@mapples/form/src/state/index.ts#L262)

Checks if there is a next state available for redo operation.

#### Returns

`boolean`

True if redo operation is possible
