import { RegisteredComponent } from '@mapples/types';

import GradientBackground from './GradientBackground';

/**
 * Schematic configuration for the GradientBackground component.
 *
 * A gradient-filled container that `forwardRef`s to a native `View`, so the
 * canvas can measure it (`measureInWindow`) and make it selectable. It has
 * children, sizing, and the normal view styling, plus a linear gradient painted
 * behind its children.
 *
 * @public
 */
export const GradientBackgroundSchematic: RegisteredComponent = {
  type: 'GradientBackground',
  Component: GradientBackground,
};
