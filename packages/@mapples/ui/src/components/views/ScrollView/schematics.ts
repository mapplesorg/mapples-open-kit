import { RegisteredComponent } from '@mapples/types';

import HorizontalScrollView from './HorizontalScrollView';
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
export const HorizontalScrollViewSchematic: RegisteredComponent = {
  type: 'HorizontalScrollView',
  Component: HorizontalScrollView,
};
