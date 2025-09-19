import { FC, PropsWithChildren } from 'react';

import { StateContextProvider } from './context';
import { StateContextType } from './types';

/**
 * State provider component that makes state data available to child components.
 *
 * This component wraps the application or a portion of it to provide state
 * data through React context. Child components can access this state using
 * the useDataState and useDataProps hooks.
 *
 * @param props - The component props
 * @param props.children - Child components that will have access to the state
 * @param props.value - The state object to provide to child components
 *
 * @example
 * ```tsx
 * const App = () => {
 *   const appState = {
 *     user: { name: 'John', email: 'john@example.com' },
 *     settings: { theme: 'dark' }
 *   };
 *
 *   return (
 *     <StateProvider value={appState}>
 *       <MyComponent />
 *     </StateProvider>
 *   );
 * };
 * ```
 */
const StateProvider: FC<PropsWithChildren & StateContextType> = ({
  children,
  value,
}) => {
  return (
    <StateContextProvider value={{ value }}>{children}</StateContextProvider>
  );
};

export default StateProvider;
