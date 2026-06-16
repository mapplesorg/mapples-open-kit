import { RegisteredComponent } from '@mapples/types';

import ScrollView from './ScrollView';

/**
 * Schematic configuration for the ScrollView component.
 *
 * @public
 */
export const ScrollViewSchematic: RegisteredComponent = {
  type: 'ScrollView',
  Component: ScrollView,
};

/**
 * Schematic configuration for a horizontally-scrolling ScrollView.
 *
 * @public
 */
export const HorizontalScrollView: RegisteredComponent = {
  ...ScrollViewSchematic,
  type: 'HorizontalScrollView',
};
