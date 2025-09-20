import { Action } from './action';

/**
 * Represents the configuration interface for a Mapplet application.
 * A Mapplet is a self-contained application that can be embedded or run standalone.
 *
 * @interface MappletType
 * @template State - The type of the application state (must extend object)
 *
 * @property {State} [state] - Optional initial state object for the Mapplet
 * @property {(action: Action) => void} [onAction] - Optional callback function to handle actions emitted by the Mapplet
 *
 * @example
 * ```typescript
 * interface MyAppState {
 *   user: { name: string; email: string };
 *   settings: { theme: string };
 * }
 *
 * const myMapplet: MappletType<MyAppState> = {
 *   state: {
 *     user: { name: 'John', email: 'john@example.com' },
 *     settings: { theme: 'dark' }
 *   },
 *   onAction: (action) => {
 *     console.log('Mapplet action:', action);
 *     // Handle analytics, logging, etc.
 *   }
 * };
 * ```
 */
export interface MappletType<State extends object = object> {
  /** Optional initial state object for the Mapplet */
  state?: State;
  /** Optional callback function to handle actions emitted by the Mapplet */
  onAction?: (action: Action) => void;
}
