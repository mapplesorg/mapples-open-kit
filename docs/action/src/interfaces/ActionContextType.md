[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [action/src](../README.md) / ActionContextType

# Interface: ActionContextType

Defined in: [packages/@mapples/action/src/types.ts:10](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/action/src/types.ts#L10)

Context type for the Action context provider.
Contains the RxJS Subject that manages action emissions and subscriptions.

 ActionContextType

## Properties

### actionStore

> **actionStore**: `Subject`\<[`Action`](../../../types/src/interfaces/Action.md)\>

Defined in: [packages/@mapples/action/src/types.ts:12](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/action/src/types.ts#L12)

RxJS Subject for emitting and subscribing to actions
