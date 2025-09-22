[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/action](../README.md) / ActionContextType

# Interface: ActionContextType

Defined in: [types.ts:10](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/action/src/types.ts#L10)

Context type for the Action context provider.
Contains the RxJS Subject that manages action emissions and subscriptions.

 ActionContextType

## Properties

### actionStore

> **actionStore**: `Subject`\<[`Action`](../../types/interfaces/Action.md)\>

Defined in: [types.ts:12](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/action/src/types.ts#L12)

RxJS Subject for emitting and subscribing to actions
