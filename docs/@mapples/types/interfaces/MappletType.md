[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/types](../README.md) / MappletType

# Interface: MappletType\<State\>

Defined in: [mapplet.ts:32](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/types/src/mapplet.ts#L32)

Represents the configuration interface for a Mapplet application.
A Mapplet is a self-contained application that can be embedded or run standalone.

 MappletType

## Example

```typescript
interface MyAppState {
  user: { name: string; email: string };
  settings: { theme: string };
}

const myMapplet: MappletType<MyAppState> = {
  state: {
    user: { name: 'John', email: 'john@example.com' },
    settings: { theme: 'dark' }
  },
  onAction: (action) => {
    console.log('Mapplet action:', action);
    // Handle analytics, logging, etc.
  }
};
```

## Type Parameters

### State

`State` *extends* `object` = `object`

The type of the application state (must extend object)

## Properties

### state?

> `optional` **state**: `State`

Defined in: [mapplet.ts:34](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/types/src/mapplet.ts#L34)

Optional initial state object for the Mapplet

***

### onAction()?

> `optional` **onAction**: (`action`) => `void`

Defined in: [mapplet.ts:36](https://github.com/mapplesorg/mapples-open-kit/blob/dd963146bbe11b4162ad27f5187c1779c86867a0/packages/@mapples/types/src/mapplet.ts#L36)

Optional callback function to handle actions emitted by the Mapplet

#### Parameters

##### action

[`Action`](Action.md)

#### Returns

`void`
