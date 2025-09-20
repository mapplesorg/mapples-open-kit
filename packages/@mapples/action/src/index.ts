import ActionProvider from './ActionProvider';

/**
 * @fileoverview Main entry point for the @mapples/action package.
 *
 * This package provides a centralized action management system for React Native applications
 * using RxJS observables. It allows you to track user actions, handle analytics, and manage
 * application state through a reactive action store.
 *
 * @packageDocumentation
 */

// Export all types for external use
export * from './types';

// Export all hooks for external use
export * from './hooks';

/**
 * Default export: ActionProvider component
 *
 * The main component that should be used to wrap your application or specific parts
 * that need action tracking capabilities.
 *
 * @example
 * ```tsx
 * import ActionProvider from '@mapples/action';
 *
 * function App() {
 *   return (
 *     <ActionProvider onAction={(action) => console.log(action)}>
 *       <YourApp />
 *     </ActionProvider>
 *   );
 * }
 * ```
 */
export default ActionProvider;
