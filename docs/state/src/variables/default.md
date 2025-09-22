[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../modules.md) / [state/src](../README.md) / default

# Variable: default

> `const` **default**: `FC`\<`PropsWithChildren`\<`StateProviderProps`\>\>

Defined in: [packages/@mapples/state/src/StateProvider.tsx:33](https://github.com/mapplesorg/mapples-open-kit/blob/f8dd61e68dff17d513e02dca2868b3984ba36786/packages/@mapples/state/src/StateProvider.tsx#L33)

State provider component that makes state data available to child components.

This component wraps the application or a portion of it to provide state
data through React context. Child components can access this state using
the useDataState and useDataProps hooks.

## Param

The component props

## Param

Child components that will have access to the state

## Param

The state object to provide to child components

## Example

```tsx
const App = () => {
  const appState = {
    user: { name: 'John', email: 'john@example.com' },
    settings: { theme: 'dark' }
  };

  return (
    <StateProvider state={appState}>
      <MyComponent />
    </StateProvider>
  );
};
```
