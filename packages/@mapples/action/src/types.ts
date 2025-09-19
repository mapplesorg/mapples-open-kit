import { Subject } from 'rxjs';

/**
 * Represents the payload data that can be attached to an action.
 *
 * @interface ActionPayload
 */
export interface ActionPayload {
  /** Original event data from the source event (e.g., touch events, form data) */
  originalEventData?: any[];
  /** Custom data payload specific to the action */
  data?: any;
}

/**
 * Represents a user action that occurred in the application.
 * Actions are used for tracking user interactions, analytics, and state management.
 *
 * @interface Action
 */
export interface Action {
  /** Timestamp when the action occurred (in milliseconds since epoch) */
  time: number;
  /** Optional string identifier for the type of action (e.g., 'BUTTON_PRESSED', 'FORM_SUBMITTED') */
  type?: string;
  /** Optional payload containing additional data about the action */
  payload?: ActionPayload;
}

/**
 * Context type for the Action context provider.
 * Contains the RxJS Subject that manages action emissions and subscriptions.
 *
 * @interface ActionContextType
 */
export interface ActionContextType {
  /** RxJS Subject for emitting and subscribing to actions */
  actionStore: Subject<Action>;
}

/**
 * Props for the ActionProvider component.
 *
 * @interface ActionProviderProps
 */
export interface ActionProviderProps {
  /** Callback function that will be called whenever an action is emitted */
  onAction: (action: Action) => void;
}
