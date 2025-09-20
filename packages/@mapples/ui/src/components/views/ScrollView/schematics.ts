import { RegisteredComponent } from '@mapples/types';

import ScrollView from './ScrollView';

export const ScrollViewSchematic: RegisteredComponent = {
  type: 'ScrollView',
  Component: ScrollView,
};

export const HorizontalScrollView: RegisteredComponent = {
  ...ScrollViewSchematic,
  type: 'HorizontalScrollView',
};
