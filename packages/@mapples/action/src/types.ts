import { Subject } from 'rxjs';

export interface ActionPayload {
  originalEventData?: any[];
  data?: any;
}

export interface Action {
  time: number;
  type?: string;
  payload?: ActionPayload;
}

export interface ActionContextType {
  actionStore: Subject<Action>;
}

export interface ActionProviderProps {
  onAction: (action: Action) => void;
}
