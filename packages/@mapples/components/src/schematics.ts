import { RegisteredComponents } from '@mapples/types';

import { ActionsSchematics } from './components/actions/schematics';
import { ContentSchematics } from './components/content/schematics';
import { FeedbackSchematics } from './components/feedback/schematics';
import { InputsSchematics } from './components/inputs/schematics';
import { NavigationSchematics } from './components/navigation/schematics';
import { OverlaysSchematics } from './components/overlays/schematics';

/**
 * Registry of all `@mapples/components` components, keyed by their schematic
 * `type` string.
 *
 * Pass this object to the `@mapples/render` pipeline so it can resolve
 * component types at runtime.
 *
 * @example
 * ```tsx
 * import { Components } from '@mapples/components';
 * import { UIComponents } from '@mapples/ui';
 * import { RenderProvider } from '@mapples/render';
 *
 * <RenderProvider components={{ ...Components, ...UIComponents }} assets={assets} />
 * ```
 */
export const Components: RegisteredComponents = {
  ...ActionsSchematics,
  ...InputsSchematics,
  ...ContentSchematics,
  ...NavigationSchematics,
  ...FeedbackSchematics,
  ...OverlaysSchematics,
};
