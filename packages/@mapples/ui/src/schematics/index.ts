import {
  RegisteredComponents,
  RegisteredComponentsGroup,
} from '@mapples/types';

import Icon from '../assets';
import { InputsSchematics } from '../components/inputs';
import { MediaSchematics } from '../components/media';
import { TypographySchematics } from '../components/typography';
import { ViewsSchematics } from '../components/views';

export const Components: RegisteredComponents = {
  ...ViewsSchematics,
  ...TypographySchematics,
  ...InputsSchematics,
  ...MediaSchematics,
};

export const Groups: RegisteredComponentsGroup[] = [
  {
    id: 'view-group',
    label: 'View',
    Icon: Icon.Views,
  },
  {
    id: 'typography-group',
    label: 'Typography',
    Icon: Icon.Typography,
  },
  {
    id: 'media-group',
    label: 'Media',
    Icon: Icon.Media,
  },
  {
    id: 'input-group',
    label: 'Inputs',
    Icon: Icon.Inputs,
  },
];
