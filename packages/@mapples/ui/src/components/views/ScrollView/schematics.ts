import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import ScrollView from './ScrollView';

export const ScrollViewSchematic: RegisteredComponent = {
  label: 'V Scroll',
  type: 'ScrollView',
  Component: ScrollView,
  groupId: 'view-group',
  Icon: Icon.VerticalScroll,
  hasChildren: true,
  styleKeys: [
    {
      value: 'style',
      label: 'Style',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.ScrollSurface,
        StyleFormType.Spacing,
        StyleFormType.Borders,
        StyleFormType.Shadow,
      ],
    },
    {
      value: 'contentContainerStyle',
      label: 'Content Container',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Spacing,
        StyleFormType.Borders,
        StyleFormType.Shadow,
      ],
    },
  ],
  props: [
    {
      type: PropsFormType.Switch,
      label: 'Vertical scroll indicator',
      propsKey: 'showsVerticalScrollIndicator',
    },
    {
      type: PropsFormType.Switch,
      label: 'Horizontal scroll indicator',
      propsKey: 'showHorizontalScrollIndicator',
    },
  ],
  initialProps: {
    showsVerticalScrollIndicator: true,
    showHorizontalScrollIndicator: true,
    styled: {
      style: {
        flex: 1,
        backgroundColor: SystemPalette.background,
      },
    },
  },
  actionProps: [],
};

export const HorizontalScrollView: RegisteredComponent = {
  ...ScrollViewSchematic,
  type: 'HorizontalScrollView',
  label: 'H Scroll',
  Icon: Icon.HorizontalScroll,
  initialProps: {
    ...ScrollViewSchematic.initialProps,
    horizontal: true,
  },
};
