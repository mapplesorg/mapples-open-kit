[**@mapples/action**](../README.md)

***

[@mapples/action](../globals.md) / default

# Variable: default

> `const` **default**: `FC`\<`PropsWithChildren`\<[`ActionProviderProps`](../interfaces/ActionProviderProps.md)\>\>

Defined in: [ActionProvider.tsx:39](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/action/src/ActionProvider.tsx#L39)

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
