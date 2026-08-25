/**
 * @fileoverview State management package for Mapples applications
 *
 * This package provides a simple and efficient state management solution
 * using React Context. It allows you to share state data across your
 * application components and provides hooks for accessing and processing
 * that data.
 *
 * @example
 * ```tsx
 * import { StateProvider, useDataState, useDataProps } from '@mapples/state';
 *
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

import StateProvider from './StateProvider';

export * from './hooks';
export * from './types';
export * from './actionCommands';
export * from './writable/types';
export { useVariablesState } from './writable/context';
export {
  default as VariablesProvider,
  getVariableValue,
} from './writable/VariablesProvider';
export { default as VariablesScope } from './writable/VariablesScope';
export { default as StateActionHandler } from './StateActionHandler';

export default StateProvider;
