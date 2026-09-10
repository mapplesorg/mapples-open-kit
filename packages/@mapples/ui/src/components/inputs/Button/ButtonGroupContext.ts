import { createContext } from 'react';

/**
 * What a button group tells the `Button`s inside it. A context rather than a
 * wrapper per child: the buttons size themselves, so the layout is the same
 * wherever the children come from (the editor renders them through its own
 * drop area, not as direct children of the group).
 *
 * @public
 */
export interface ButtonGroupContextValue {
  /** Main axis of the group. */
  direction: 'row' | 'column';
  /** Each button takes an equal share of the group's main axis. */
  equal: boolean;
  /** The group spans its parent, so shares split that width rather than the labels'. */
  fill: boolean;
}

/** @public */
export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(
  null,
);
