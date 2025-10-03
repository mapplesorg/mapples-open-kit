[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/action](../README.md) / default

# Variable: default

> `const` **default**: `FC`\<`PropsWithChildren`\<[`ActionProviderProps`](../interfaces/ActionProviderProps.md)\>\>

Defined in: [ActionProvider.tsx:39](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/action/src/ActionProvider.tsx#L39)

ActionProvider component that manages the action store and provides it to child components.

This component:
- Creates and manages an RxJS Subject for action emissions
- Subscribes to actions and calls the provided onAction callback
- Provides the action store to child components via React context
- Automatically cleans up subscriptions when the component unmounts

## Component

## Param

The component props

## Param

Child components that will have access to the action store

## Param

Callback function called whenever an action is emitted

## Example

```tsx
function App() {
  const handleAction = (action: Action) => {
    console.log('Action received:', action);
    // Handle analytics, logging, etc.
  };

  return (
    <ActionProvider onAction={handleAction}>
      <MyApp />
    </ActionProvider>
  );
}
```
