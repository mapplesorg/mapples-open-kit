import { RegisteredComponent } from '@mapples/types';

import Video from './Video';

/**
 * Schematic registration entry for the `Video` component.
 *
 * Used by the `@mapples/render` pipeline to resolve the `"Video"` element type
 * to the `Video` React component at runtime.
 *
 * @public
 */
export const VideoSchematic: RegisteredComponent = {
  type: 'Video',
  Component: Video,
};
