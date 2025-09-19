import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import Text from './Text';

export const TextSchematic: RegisteredComponent = {
  label: 'Text',
  type: 'Text',
  Component: Text,
  groupId: 'typography-group',
  Icon: Icon.Text,
  initialProps: {
    text: 'Text',
    styled: {
      style: {
        fontSize: 16,
        color: SystemPalette.text,
      },
    },
  },
  styleKeys: [
    {
      value: 'style',
      label: 'Style',
      forms: [
        StyleFormType.Text,
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
      label: 'Text',
      propsKey: 'text',
      dataProp: true,
    },
  ],
  actionProps: [],
};
