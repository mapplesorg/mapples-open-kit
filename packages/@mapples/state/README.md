# @mapples/state

A lightweight and efficient state management solution for React and React Native applications using React Context.

## Features

- 🚀 **Simple API** - Easy to use with minimal boilerplate
- 📦 **Lightweight** - Small bundle size with minimal external dependencies
- 🔄 **React Context** - Built on React's built-in context system
- 🎯 **TypeScript** - Full TypeScript support with comprehensive type definitions
- 🧩 **Flexible** - Works with any data structure and supports complex key patterns
- ⚡ **Performance** - Optimized with memoization and efficient re-renders

## Installation

```bash
npm install @mapples/state
# or
yarn add @mapples/state
```

## Quick Start

### 1: Wrap your app with StateProvider

```tsx
import StateProvider from '@mapples/state';

const App = () => {
  const appState = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        age: 30,
        location: 'New York',
      },
    },
    settings: {
      theme: 'dark',
      language: 'en',
    },
  };

  return (
    <StateProvider state={appState}>
      <MyComponent />
    </StateProvider>
  );
};
```

### 2: Access state in components

```tsx
import { useDataState } from '@mapples/state';

const MyComponent = () => {
  const { getValue } = useDataState();

  const userName = getValue({ key: 'user.name', active: true });
  const userEmail = getValue({ key: 'user.email', active: true });
  const userAge = getValue({ key: 'user.profile.age', active: true });

  return (
    <div>
      <h1>Hello, {userName}!</h1>
      <p>Email: {userEmail}</p>
      <p>Age: {userAge}</p>
    </div>
  );
};
```

## API Reference

### StateProvider

The main provider component that makes state available to child components.

#### Props

| Prop       | Type        | Description                                         |
| ---------- | ----------- | --------------------------------------------------- |
| `state`    | `object`    | The state object to provide to child components     |
| `children` | `ReactNode` | Child components that will have access to the state |

#### Example

```tsx
<StateProvider state={{ user: { name: 'John' } }}>
  <App />
</StateProvider>
```

### useDataState

Hook for accessing and retrieving values from the application state.

#### Returns

| Property   | Type                                          | Description                            |
| ---------- | --------------------------------------------- | -------------------------------------- |
| `getValue` | `(dataProp: DataProp, altValue?: any) => any` | Function to retrieve values from state |

#### DataProp Interface

| Property | Type      | Description                                                       |
| -------- | --------- | ----------------------------------------------------------------- |
| `key`    | `string`  | The key path(s) to retrieve from state                            |
| `active` | `boolean` | Whether the data prop is active (inactive props return undefined) |

#### Key Patterns

The `getValue` function supports various key patterns:

##### Simple Keys

```tsx
// Access nested properties using dot notation
const name = getValue({ key: 'user.name', active: true });
const age = getValue({ key: 'user.profile.age', active: true });
```

##### Multiple Keys with Separator

```tsx
// Join multiple values with a custom separator
// Format: 'key1;key2;separator'
const fullName = getValue({
  key: 'user.firstName;user.lastName; ',
  active: true,
});
const address = getValue({
  key: 'user.street;user.city;user.state; ',
  active: true,
});
```

##### Special Key: '(this)'

```tsx
// Get the entire state object
const entireState = getValue({ key: '(this)', active: true });
```

##### With Fallback Values

```tsx
// Provide a fallback value if the key is not found
const age = getValue({ key: 'user.age', active: true }, 'Unknown');
```

#### Example

```tsx
const UserProfile = () => {
  const { getValue } = useDataState();

  const name = getValue({ key: 'user.name', active: true });
  const fullAddress = getValue({
    key: 'user.street;user.city;user.state; ',
    active: true,
  });
  const theme = getValue({ key: 'settings.theme', active: true }, 'light');

  return (
    <div>
      <h2>{name}</h2>
      <p>{fullAddress}</p>
      <p>Theme: {theme}</p>
    </div>
  );
};
```

### useDataProps

Hook for processing multiple data properties and returning resolved values.

#### Parameters

| Parameter | Type        | Description                                        |
| --------- | ----------- | -------------------------------------------------- |
| `data`    | `DataProps` | Optional object containing DataProp configurations |

#### Returns

A memoized object containing resolved values from the data props, with undefined values filtered out.

#### Example

```tsx
const UserCard = () => {
  const dataProps = {
    name: { key: 'user.name', active: true },
    email: { key: 'user.email', active: true },
    age: { key: 'user.age', active: false }, // This will be filtered out
    address: { key: 'user.street;user.city; ', active: true },
    theme: { key: 'settings.theme', active: true },
  };

  const resolvedProps = useDataProps(dataProps);
  // Result: {
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   address: '123 Main St New York',
  //   theme: 'dark'
  // }

  return (
    <div className={`card ${resolvedProps.theme}`}>
      <h3>{resolvedProps.name}</h3>
      <p>{resolvedProps.email}</p>
      <p>{resolvedProps.address}</p>
    </div>
  );
};
```

## Advanced Usage

### Dynamic State Updates

Since the state is provided through React Context, you can update it by changing the `state` prop of `StateProvider`:

```tsx
const App = () => {
  const [appState, setAppState] = useState({
    user: { name: 'John', email: 'john@example.com' },
    settings: { theme: 'light' },
  });

  const updateUser = (newUser) => {
    setAppState((prev) => ({
      ...prev,
      user: { ...prev.user, ...newUser },
    }));
  };

  return (
    <StateProvider state={appState}>
      <UserForm onUpdate={updateUser} />
    </StateProvider>
  );
};
```

### Conditional Data Access

Use the `active` property to conditionally access data:

```tsx
const ConditionalComponent = ({ showEmail }) => {
  const { getValue } = useDataState();

  const name = getValue({ key: 'user.name', active: true });
  const email = getValue({ key: 'user.email', active: showEmail });

  return (
    <div>
      <h3>{name}</h3>
      {email && <p>{email}</p>}
    </div>
  );
};
```

### Complex Data Structures

The state can contain any JavaScript object structure:

```tsx
const complexState = {
  users: [
    { id: 1, name: 'John', role: 'admin' },
    { id: 2, name: 'Jane', role: 'user' },
  ],
  permissions: {
    admin: ['read', 'write', 'delete'],
    user: ['read'],
  },
  config: {
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
    },
  },
};

// Access array elements
const firstUser = getValue({ key: 'users.0.name', active: true });

// Access nested configuration
const apiUrl = getValue({ key: 'config.api.baseUrl', active: true });
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```tsx
import StateProvider, { useDataState, useDataProps } from '@mapples/state';

// StateProvider is fully typed
const App: React.FC = () => {
  const state: Record<string, any> = {
    user: { name: 'John', age: 30 },
  };

  return (
    <StateProvider state={state}>
      <MyComponent />
    </StateProvider>
  );
};

// Hooks are fully typed
const MyComponent: React.FC = () => {
  const { getValue } = useDataState();

  // getValue is properly typed
  const name: string | undefined = getValue({ key: 'user.name', active: true });

  return <div>{name}</div>;
};
```

## Performance Considerations

- The `useDataProps` hook uses `useMemo` to prevent unnecessary recalculations
- State updates only trigger re-renders in components that actually use the state
- Consider using `React.memo` for components that don't need to re-render on every state change

```tsx
const OptimizedComponent = React.memo(() => {
  const { getValue } = useDataState();
  const name = getValue({ key: 'user.name', active: true });

  return <div>{name}</div>;
});
```

## Best Practices

1. **Keep state structure flat when possible** - Deep nesting can make key paths complex
2. **Use meaningful key names** - Make your state keys descriptive and consistent
3. **Leverage the `active` property** - Use it to conditionally include/exclude data
4. **Combine multiple values efficiently** - Use the separator pattern for related data
5. **Provide fallback values** - Always consider what happens when data is missing

## Migration from Other State Management

### From Redux

```tsx
// Before (Redux)
const mapStateToProps = (state) => ({
  userName: state.user.name,
  userEmail: state.user.email,
});

// After (@mapples/state)
const MyComponent = () => {
  const { getValue } = useDataState();
  const userName = getValue({ key: 'user.name', active: true });
  const userEmail = getValue({ key: 'user.email', active: true });

  return (
    <div>
      {userName} - {userEmail}
    </div>
  );
};
```

### From Context API

```tsx
// Before (Custom Context)
const UserContext = createContext();
const { user } = useContext(UserContext);

// After (@mapples/state)
const { getValue } = useDataState();
const user = getValue({ key: 'user', active: true });
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Mapples](https://mapples.org)
