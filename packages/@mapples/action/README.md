# @mapples/action

A React Native action management package that provides a centralized way to handle and track user actions throughout your application using RxJS observables.

## Features

- 🎯 **Action Tracking**: Centralized action store using RxJS Subject for reactive action handling
- 🔒 **Type Safety**: Full TypeScript support with comprehensive type definitions
- ⚛️ **React Integration**: Seamless integration with React hooks and context
- 🎁 **Flexible Payload**: Support for custom action payloads and event data
- 🏗️ **Provider Pattern**: Easy setup with ActionProvider component

## Installation

```bash
npm install @mapples/action
# or
yarn add @mapples/action
```

## Usage

### Basic Setup

Wrap your app with the `ActionProvider` to enable action tracking:

```tsx
import React from 'react';
import ActionProvider from '@mapples/action';

function App() {
  const handleAction = (action) => {
    console.log('Action triggered:', action);
    // Handle the action (e.g., analytics, logging, state updates)
  };

  return (
    <ActionProvider onAction={handleAction}>
      {/* Your app components */}
    </ActionProvider>
  );
}
```

### Using the Action Store

Access the action store in your components using the `useActionStore` hook:

```tsx
import React from 'react';
import { useActionStore } from '@mapples/action';

function MyComponent() {
  const actionStore = useActionStore();

  const handleButtonPress = () => {
    // Emit an action
    actionStore.next({
      time: Date.now(),
      type: 'BUTTON_PRESSED',
      payload: {
        data: { buttonId: 'submit' },
        originalEventData: ['button', 'press'],
      },
    });
  };

  return <button onPress={handleButtonPress}>Submit</button>;
}
```

### Action Types

The package provides the following TypeScript interfaces:

```typescript
interface Action {
  time: number; // Timestamp when action occurred
  type?: string; // Action type identifier
  payload?: ActionPayload; // Optional payload data
}

interface ActionPayload {
  originalEventData?: any[]; // Original event data
  data?: any; // Custom data payload
}
```

## API Reference

### ActionProvider

A React context provider that manages the action store and handles action subscriptions.

**Props:**

- `onAction: (action: Action) => void` - Callback function called when an action is emitted
- `children: ReactNode` - Child components

### useActionStore

A React hook that provides access to the action store.

**Returns:**

- `Subject<Action>` - RxJS Subject for emitting and subscribing to actions

**Example:**

```tsx
const actionStore = useActionStore();

// Emit an action
actionStore.next({
  time: Date.now(),
  type: 'USER_LOGIN',
  payload: { data: { userId: '123' } },
});

// Subscribe to actions (if needed)
useEffect(() => {
  const subscription = actionStore.subscribe((action) => {
    console.log('New action:', action);
  });

  return () => subscription.unsubscribe();
}, [actionStore]);
```

## Advanced Usage

### Custom Action Types

Define custom action types for better type safety:

```tsx
type CustomActionType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'BUTTON_PRESSED'
  | 'FORM_SUBMITTED';

interface CustomAction extends Action {
  type: CustomActionType;
  payload: {
    data: any;
    originalEventData?: any[];
  };
}
```

### Action Middleware

You can create middleware to process actions before they reach the main handler:

```tsx
function createActionMiddleware(store: Subject<Action>) {
  return store.pipe(
    // Add timestamp if missing
    map((action) => ({
      ...action,
      time: action.time || Date.now(),
    })),
    // Filter out invalid actions
    filter((action) => action.type && action.type.length > 0),
  );
}
```

## Best Practices

1. **Consistent Action Types**: Use consistent naming conventions for action types (e.g., `COMPONENT_ACTION` format)

2. **Meaningful Payloads**: Include relevant data in action payloads for better debugging and analytics

3. **Error Handling**: Always handle potential errors in your action handlers

4. **Performance**: Be mindful of action frequency to avoid performance issues

5. **Testing**: Test your action flows to ensure they work as expected

## License

MIT

## Author

Oleksandr Soloviov - [mapples.org](https://mapples.org/people/olek_soloviov)
