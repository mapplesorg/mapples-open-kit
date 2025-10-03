[**Mapples Open Kit - Types**](../../../README.md)

***

[Mapples Open Kit - Types](../../../packages.md) / [@mapples/app](../README.md) / default

# Variable: default

> `const` **default**: `FC`\<`PropsWithChildren`\<[`MapplesAppProps`](../interfaces/MapplesAppProps.md)\>\>

Defined in: [MapplesApp.tsx:72](https://github.com/mapplesorg/mapples-open-kit/blob/8763b367e2a12f993555d9a72e4732e58951d927/packages/@mapples/app/src/MapplesApp.tsx#L72)

The main MapplesApp component that provides the core Mapples ecosystem functionality.

This component sets up the essential providers for styling, rendering, and asset management
that are required for all Mapples applications. It handles font loading and provides
a unified entry point for the Mapples ecosystem.

## Component

## Param

The component props

## Returns

The configured Mapples app with all necessary providers

## Examples

```tsx
import MapplesApp from '@mapples/app';

function App() {
  return (
    <MapplesApp>
      <YourAppContent />
    </MapplesApp>
  );
}
```

```tsx
import MapplesApp from '@mapples/app';

function App() {
  return (
    <MapplesApp
      showFontLoadingIndicator={true}
      FontLoadingIndicator={<LoadingSpinner />}
    >
      <YourAppContent />
    </MapplesApp>
  );
}
```
