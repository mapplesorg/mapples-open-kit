import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import FlatList from './FlatList';

const gridProps = [
  {
    type: PropsFormType.Text,
    label: 'Data',
    propsKey: 'data',
    dataProp: true,
  },
  {
    type: PropsFormType.Switch,
    label: 'Horizontal',
    propsKey: 'horizontal',
  },
  {
    type: PropsFormType.Switch,
    label: 'Vertical scroll indicator',
    propsKey: 'showsVerticalScrollIndicator',
  },
  {
    type: PropsFormType.Switch,
    label: 'Horizontal scroll indicator',
    propsKey: 'showsHorizontalScrollIndicator',
  },
  {
    type: PropsFormType.Switch,
    label: 'Paging enabled',
    propsKey: 'pagingEnabled',
  },
  {
    type: PropsFormType.Text,
    label: 'Initial num to render',
    propsKey: 'initialNumToRender',
  },
  {
    type: PropsFormType.Text,
    label: 'Max to render per batch',
    propsKey: 'maxToRenderPerBatch',
  },
  {
    type: PropsFormType.Select,
    label: 'Deceleration rate',
    propsKey: 'decelerationRate',
    options: [
      { label: 'Normal', value: 'normal' },
      { label: 'Fast', value: 'fast' },
    ],
  },
  {
    type: PropsFormType.Select,
    label: 'Snap to alignment',
    propsKey: 'snapToAlignment',
    options: [
      { label: 'Start', value: 'start' },
      { label: 'Center', value: 'center' },
      { label: 'End', value: 'end' },
    ],
  },
  {
    type: PropsFormType.Select,
    label: 'Keyboard dismiss mode',
    propsKey: 'keyboardDismissMode',
    options: [
      { label: 'None', value: 'none' },
      { label: 'On-drag', value: 'on-drag' },
      { label: 'Interactive', value: 'interactive' },
    ],
  },
  {
    type: PropsFormType.Select,
    label: 'Keyboard should persist taps',
    propsKey: 'keyboardShouldPersistTaps',
    options: [
      { label: 'Never', value: 'never' },
      { label: 'Handled', value: 'handled' },
      { label: 'Always', value: 'always' },
    ],
  },
  {
    type: PropsFormType.Select,
    label: 'Content inset adjustment behavior',
    propsKey: 'contentInsetAdjustmentBehavior',
    options: [
      { label: 'Sutomatic', value: 'automatic' },
      { label: 'ScrollableAxes', value: 'scrollableAxes' },
      { label: 'Never', value: 'never' },
      { label: 'Always', value: 'always' },
    ],
  },
];

const GridStyleKeys = [
  {
    value: 'style',
    label: 'Container',
    forms: [
      StyleFormType.Dimension,
      StyleFormType.Position,
      StyleFormType.Surface,
      StyleFormType.Spacing,
      StyleFormType.Borders,
      StyleFormType.Shadow,
    ],
  },
  {
    value: 'styleList',
    label: 'List',
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
  {
    value: 'columnWrapperStyle',
    label: 'Column Wrapper',
    forms: [
      StyleFormType.Dimension,
      StyleFormType.Position,
      StyleFormType.Surface,
      StyleFormType.Spacing,
      StyleFormType.Borders,
      StyleFormType.Shadow,
    ],
  },
];

export const FlatListSchematic: RegisteredComponent = {
  label: 'Flat List',
  type: 'FlatList',
  Component: FlatList as unknown as any,
  groupId: 'view-group',
  Icon: Icon.FlatList,
  hasChildren: true,
  styleKeys: [
    {
      value: 'style',
      label: 'Container',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Spacing,
        StyleFormType.Borders,
        StyleFormType.Shadow,
      ],
    },
    {
      value: 'styleList',
      label: 'List',
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
      type: PropsFormType.Text,
      label: 'Data',
      propsKey: 'data',
      dataProp: true,
    },
    {
      type: PropsFormType.Switch,
      label: 'Horizontal',
      propsKey: 'horizontal',
    },
    {
      type: PropsFormType.Switch,
      label: 'Vertical scroll indicator',
      propsKey: 'showsVerticalScrollIndicator',
    },
    {
      type: PropsFormType.Switch,
      label: 'Horizontal scroll indicator',
      propsKey: 'showsHorizontalScrollIndicator',
    },
    {
      type: PropsFormType.Switch,
      label: 'Paging enabled',
      propsKey: 'pagingEnabled',
    },
    {
      type: PropsFormType.Text,
      label: 'Initial num to render',
      propsKey: 'initialNumToRender',
    },
    {
      type: PropsFormType.Text,
      label: 'Max to render per batch',
      propsKey: 'maxToRenderPerBatch',
    },
    {
      type: PropsFormType.Select,
      label: 'Deceleration rate',
      propsKey: 'decelerationRate',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Fast', value: 'fast' },
      ],
    },
    {
      type: PropsFormType.Select,
      label: 'Snap to alignment',
      propsKey: 'snapToAlignment',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
      ],
    },
    {
      type: PropsFormType.Select,
      label: 'Keyboard dismiss mode',
      propsKey: 'keyboardDismissMode',
      options: [
        { label: 'None', value: 'none' },
        { label: 'On-drag', value: 'on-drag' },
        { label: 'Interactive', value: 'interactive' },
      ],
    },
    {
      type: PropsFormType.Select,
      label: 'Keyboard should persist taps',
      propsKey: 'keyboardShouldPersistTaps',
      options: [
        { label: 'Never', value: 'never' },
        { label: 'Handled', value: 'handled' },
        { label: 'Always', value: 'always' },
      ],
    },
    {
      type: PropsFormType.Select,
      label: 'Content inset adjustment behavior',
      propsKey: 'contentInsetAdjustmentBehavior',
      options: [
        { label: 'Sutomatic', value: 'automatic' },
        { label: 'ScrollableAxes', value: 'scrollableAxes' },
        { label: 'Never', value: 'never' },
        { label: 'Always', value: 'always' },
      ],
    },
  ],
  initialProps: {
    data: [{}],
    refreshing: false,
    horizontal: false,
    showsVerticalScrollIndicator: true,
    showsHorizontalScrollIndicator: true,
    styled: {
      style: {
        flex: 1,
        backgroundColor: SystemPalette.background,
      },
    },
  },
  actionProps: ['onEndReached', 'onRefresh', 'onScroll'],
};

export const GridTwoColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  label: 'Grid 2',
  type: 'GridTwoColumns',
  Icon: Icon.Grid2,
  styleKeys: GridStyleKeys,
  initialProps: {
    ...FlatListSchematic.initialProps,
    numColumns: 2,
  },
  props: gridProps,
};

export const GridThreeColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  label: 'Grid 3',
  type: 'GridThreeColumns',
  Icon: Icon.Grid3,
  styleKeys: GridStyleKeys,
  initialProps: {
    ...FlatListSchematic.initialProps,
    numColumns: 3,
  },
  props: gridProps,
};

export const GridFourColumnsSchematic: RegisteredComponent = {
  ...FlatListSchematic,
  label: 'Grid 4',
  type: 'GridFourColumns',
  Icon: Icon.Grid4,
  styleKeys: GridStyleKeys,
  initialProps: {
    ...FlatListSchematic.initialProps,
    numColumns: 4,
  },
  props: gridProps,
};
