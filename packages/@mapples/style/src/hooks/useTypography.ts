import { useCallback } from 'react';

import useStyle from './useStyle';

const useTypography = () => {
  const { typographyConfig } = useStyle();

  const getTypographyStyle = useCallback(
    (key = typographyConfig.default) => {
      if (!typographyConfig.typography[key]) {
        console.warn(
          `Typography style "${key}" not found. Please check your typography config.`,
        );
      }

      return {
        color: typographyConfig.color,
        fontFamily: typographyConfig.fontFamily,
        ...(typographyConfig.typography[key] || {}),
      };
    },
    [
      typographyConfig.color,
      typographyConfig.default,
      typographyConfig.fontFamily,
      typographyConfig.typography,
    ],
  );

  return {
    typographyConfig,
    getTypographyStyle,
  };
};

export default useTypography;
