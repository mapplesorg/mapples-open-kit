/**
 * Configuration interface for the state context.
 * Contains the state data that will be provided to child components through React context.
 *
 * @interface StateContextType
 */
export interface StateContextType {
  /** The state value object that will be provided to child components */
  value: object;
}

/**
 * Props for the StateProvider component.
 * Defines the configuration for providing state data to child components.
 *
 * @interface StateProviderProps
 */
export interface StateProviderProps {
  /** Optional state object to provide to child components. If not provided, an empty object will be used */
  state?: object;
}
