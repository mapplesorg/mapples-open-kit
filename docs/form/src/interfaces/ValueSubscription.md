[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [form/src](../README.md) / ValueSubscription

# Interface: ValueSubscription\<T\>

Defined in: [packages/@mapples/form/src/types/index.ts:26](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/form/src/types/index.ts#L26)

Configuration for subscribing to form value changes.

## Type Parameters

### T

`T` = [`AnyValue`](../type-aliases/AnyValue.md)

The type of value being subscribed to

## Properties

### path?

> `optional` **path**: `string`

Defined in: [packages/@mapples/form/src/types/index.ts:28](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/form/src/types/index.ts#L28)

Optional path to a specific field. If not provided, subscribes to the entire form

***

### cb

> **cb**: [`SubscriptionCallBack`](../type-aliases/SubscriptionCallBack.md)\<`T`\>

Defined in: [packages/@mapples/form/src/types/index.ts:30](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/form/src/types/index.ts#L30)

Callback function to execute when the value changes
