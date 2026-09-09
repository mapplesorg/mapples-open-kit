import { RegisteredComponent } from '@mapples/types';

import NumberStepper from './index';

/** Registers {@link NumberStepper} under the `'NumberStepper'` type key. */
export const NumberStepperSchematic: RegisteredComponent = {
  type: 'NumberStepper',
  Component: NumberStepper,
};
