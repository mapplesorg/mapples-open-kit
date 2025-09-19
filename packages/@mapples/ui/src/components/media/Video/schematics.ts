import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Video from './Video';

export const VideoSchematic: RegisteredComponent = {
  label: 'Video',
  type: 'Video',
  Component: Video,
  groupId: 'media-group',
  Icon: Icon.Video,
  initialProps: {
    source: '',
    autoPlay: false,
    loop: false,
    controls: true,
    styled: {
      style: {
        width: '100%',
        height: 240,
        backgroundColor: SystemPalette.background,
      },
      styleVideo: {
        width: '100%',
        height: '100%',
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
      value: 'styleVideo',
      label: 'Video',
      forms: [StyleFormType.Dimension, StyleFormType.Position],
    },
  ],
  props: [
    {
      type: PropsFormType.Select,
      label: 'Source',
      propsKey: 'source',
      dataProp: false,
      options: 'video',
    },
    {
      type: PropsFormType.Select,
      label: 'Content fit',
      propsKey: 'contentFit',
      options: [
        {
          label: 'Contain',
          value: 'contain',
        },
        {
          label: 'Cover',
          value: 'cover',
        },
        {
          label: 'Fill',
          value: 'fill',
        },
      ],
    },
    {
      type: PropsFormType.Switch,
      label: 'Auto Play',
      propsKey: 'autoPlay',
    },
    {
      type: PropsFormType.Switch,
      label: 'Loop',
      propsKey: 'loop',
    },
    {
      type: PropsFormType.Switch,
      label: 'Controls',
      propsKey: 'controls',
    },
  ],
  actionProps: [],
};
