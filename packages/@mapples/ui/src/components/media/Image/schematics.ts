import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Image from './Image';

export const ImageSchematic: RegisteredComponent = {
  label: 'Image',
  type: 'Image',
  Component: Image,
  groupId: 'media-group',
  Icon: Icon.Image,
  initialProps: {
    source: '',
    alt: '',
    resizeMode: 'cover',
    styled: {
      style: {
        width: '100%',
        height: '100%',
        backgroundColor: SystemPalette.background,
      },
      styleImage: {
        width: '100%',
        height: 240,
      },
    },
  },
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
  actionProps: [],
};
