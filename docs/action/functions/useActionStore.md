[**@mapples/action**](../README.md)

***

[@mapples/action](../globals.md) / useActionStore

# Function: useActionStore()

> **useActionStore**(): `Subject`\<`Action`\>

Defined in: [hooks/useActionStore.tsx:54](https://github.com/mapplesorg/mapples-open-kit/blob/7269e2f3db19cefc33c161be49fb467b233e4994/packages/@mapples/action/src/hooks/useActionStore.tsx#L54)

Hook that provides access to the action store from the Action context.

This hook allows components to:
- Emit new actions using `actionStore.next(action)`
- Subscribe to actions using `actionStore.subscribe(callback)`
- Access the RxJS Subject for advanced reactive operations

## Returns

`Subject`\<`Action`\>

The RxJS Subject that manages action emissions and subscriptions

## Throws

Throws an error if used outside of an ActionProvider

## Examples

```tsx
function MyComponent() {
  const actionStore = useActionStore();

  const handleButtonPress = () => {
    // Emit an action
    actionStore.next({
      time: Date.now(),
      type: 'BUTTON_PRESSED',
      payload: {
        data: { buttonId: 'submit' }
      }
    });
  };

  return <button onPress={handleButtonPress}>Submit</button>;
}
```

```tsx
function ActionLogger() {
  const actionStore = useActionStore();

  useEffect(() => {
    const subscription = actionStore.subscribe(action => {
      console.log('Action logged:', action);
    });

    return () => subscription.unsubscribe();
  }, [actionStore]);

  return null;
}
```
