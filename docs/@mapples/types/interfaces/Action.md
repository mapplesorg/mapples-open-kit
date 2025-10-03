[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/types](../README.md) / Action

# Interface: Action

Defined in: [action.ts:19](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/action.ts#L19)

Represents a user action that occurred in the application.
Actions are used for tracking user interactions, analytics, and state management.

 Action

## Properties

### time

> **time**: `number`

Defined in: [action.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/action.ts#L21)

Timestamp when the action occurred (in milliseconds since epoch)

***

### type?

> `optional` **type**: `string`

Defined in: [action.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/action.ts#L23)

Optional string identifier for the type of action (e.g., 'BUTTON_PRESSED', 'FORM_SUBMITTED')

***

### payload?

> `optional` **payload**: [`ActionPayload`](ActionPayload.md)

Defined in: [action.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/types/src/action.ts#L25)

Optional payload containing additional data about the action
