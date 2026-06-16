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
