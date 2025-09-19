import {
  PropsFormType,
  RegisteredComponent,
  StyleFormType,
} from '@mapples/types';

import Icon from '../../../assets';
import { SystemPalette } from '../../../constants';

import TextInput from './TextInput';

export const TextInputSchematic: RegisteredComponent = {
  label: 'Text Input',
  type: 'TextInput',
  Component: TextInput,
  groupId: 'input-group',
  Icon: Icon.TextInput,
  initialProps: {
    placeholder: 'Enter text...',
    styled: {
      style: {
        width: '100%',
        height: '100%',
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
      label: 'Placeholder',
      propsKey: 'placeholder',
    },
    {
      type: PropsFormType.Text,
      label: 'Label',
      propsKey: 'label',
    },
    {
      type: PropsFormType.Text,
      label: 'Test value',
      propsKey: 'value',
    },
    {
      type: PropsFormType.Text,
      label: 'Test value',
      propsKey: 'styled.placeholderTextColor',
    },
  ],
  actionProps: ['onChangeText', 'onFocus', 'onBlur'],
};
