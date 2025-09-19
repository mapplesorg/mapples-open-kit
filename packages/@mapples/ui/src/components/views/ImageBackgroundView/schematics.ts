import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import ImageBackgroundView from './ImageBackgroundView';

export const ImageBackgroundViewSchematics: RegisteredComponent = {
  groupId: 'view-group',
  type: 'ImageBackgroundView',
  label: 'Image Background',
  Component: ImageBackgroundView,
  Icon: Icon.ImageBackground,
  hasChildren: true,
  styleKeys: [
    {
      value: 'style',
      label: 'Container',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Borders,
        StyleFormType.Shadow,
      ],
    },
    {
      value: 'styleContent',
      label: 'Content',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Surface,
        StyleFormType.Spacing,
      ],
    },
    {
      value: 'styleImage',
      label: 'Image',
      forms: [
        StyleFormType.Dimension,
        StyleFormType.Position,
        StyleFormType.Image,
      ],
    },
  ],
  props: [
    {
      type: PropsFormType.Text,
      label: 'Data source',
      propsKey: 'dataSource',
      dataProp: true,
    },
    {
      type: PropsFormType.Select,
      label: 'Source',
      propsKey: 'source',
      options: 'image',
    },
    {
      type: PropsFormType.Text,
      label: 'Alt Text',
      propsKey: 'alt',
    },
  ],
  initialProps: {
    horizontal: true,
    styled: {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: SystemPalette.background,
      },
    },
  },
  actionProps: [],
};
