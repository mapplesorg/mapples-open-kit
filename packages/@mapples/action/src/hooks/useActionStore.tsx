import { useContext } from 'react';

import ActionContext from '../context';

/**
 * Hook that provides access to the action store from the Action context.
 *
 * This hook allows components to:
 * - Emit new actions using `actionStore.next(action)`
 * - Subscribe to actions using `actionStore.subscribe(callback)`
 * - Access the RxJS Subject for advanced reactive operations
 *
 * @returns The RxJS Subject that manages action emissions and subscriptions.
 * When used outside of an `ActionProvider`, returns the default context Subject (a bare
 * `new Subject()` with no active subscriptions).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const actionStore = useActionStore();
 *
 *   const handleButtonPress = () => {
 *     // Emit an action
 *     actionStore.next({
 *       time: Date.now(),
 *       type: 'BUTTON_PRESSED',
 *       payload: {
 *         data: { buttonId: 'submit' }
 *       }
 *     });
 *   };
 *
 *   return <button onPress={handleButtonPress}>Submit</button>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function ActionLogger() {
 *   const actionStore = useActionStore();
 *
 *   useEffect(() => {
 *     const subscription = actionStore.subscribe(action => {
 *       console.log('Action logged:', action);
 *     });
 *
 *     return () => subscription.unsubscribe();
 *   }, [actionStore]);
 *
 *   return null;
 * }
 * ```
 */
const useActionStore = () => {
  const { actionStore } = useContext(ActionContext);

  return actionStore;
};

export default useActionStore;
