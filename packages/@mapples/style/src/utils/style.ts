import { cloneDeep, merge } from 'lodash';
import { StyleProp, StyleSheet } from 'react-native';

import {
  DefaultResponsiveConfig,
  DefaultSizingConfig,
  DefaultThemeConfig,
  DefaultTypographyConfig,
} from '../constants';
import {
  DeepPartial,
  SizableStyleProps,
  StyleContextType,
  StyledNamedStyles,
} from '../types';

const create = <T extends StyledNamedStyles<T> | StyledNamedStyles<any>>(
  style: T & StyledNamedStyles<T>,
): T => {
  return style;
};

export const init = (
  style?: DeepPartial<StyleContextType>,
): StyleContextType => {
  return {
    themeConfig: merge(cloneDeep(DefaultThemeConfig), style?.themeConfig),
    typographyConfig: merge(
      cloneDeep(DefaultTypographyConfig),
      style?.typographyConfig,
    ),
    sizingConfig: merge(cloneDeep(DefaultSizingConfig), style?.sizingConfig),
    responsiveConfig: merge(
      cloneDeep(DefaultResponsiveConfig),
      style?.responsiveConfig,
    ),
  };
};

export const flatten = <T extends object>(
  style?: StyleProp<SizableStyleProps<T>>,
) => {
  return StyleSheet.flatten(style);
};

const Styler = {
  create,
  init,
  flatten,
};

export default Styler;
