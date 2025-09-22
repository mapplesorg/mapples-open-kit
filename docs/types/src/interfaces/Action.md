[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [types/src](../README.md) / Action

# Interface: Action

Defined in: [packages/@mapples/types/src/action.ts:19](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/types/src/action.ts#L19)

Represents a user action that occurred in the application.
Actions are used for tracking user interactions, analytics, and state management.

 Action

## Properties

### time

> **time**: `number`

Defined in: [packages/@mapples/types/src/action.ts:21](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/types/src/action.ts#L21)

Timestamp when the action occurred (in milliseconds since epoch)

***

### type?

> `optional` **type**: `string`

Defined in: [packages/@mapples/types/src/action.ts:23](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/types/src/action.ts#L23)

Optional string identifier for the type of action (e.g., 'BUTTON_PRESSED', 'FORM_SUBMITTED')

***

### payload?

> `optional` **payload**: [`ActionPayload`](ActionPayload.md)

Defined in: [packages/@mapples/types/src/action.ts:25](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/types/src/action.ts#L25)

Optional payload containing additional data about the action
