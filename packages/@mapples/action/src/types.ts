import { Action } from '@mapples/types';
import { Subject } from 'rxjs';

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
  onAction?: (action: Action) => void;
}
