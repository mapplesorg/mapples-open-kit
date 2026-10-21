import { useCallback } from 'react';

import { TextStyle } from 'react-native';

import useStyle from './useStyle';

/**
 * Hook to access and manage typography configuration and styles.
 *
 * @returns Object containing typography utilities
 *
 * @returns typographyConfig - The complete typography configuration object
 * @returns getTypographyStyle - Function to get typography styles by key
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { getTypographyStyle } = useTypography();
 *
 *   return (
 *     <Text style={getTypographyStyle('heading1')}>
 *       Large Heading
 *     </Text>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { typographyConfig, getTypographyStyle } = useTypography();
 *
 *   return (
 *     <View>
 *       <Text style={getTypographyStyle('heading1')}>Title</Text>
 *       <Text style={getTypographyStyle('body')}>Body text</Text>
 *       <Text style={getTypographyStyle('caption')}>Caption</Text>
 *     </View>
 *   );
 * };
 * ```
 */
const useTypography = () => {
  const { typographyConfig } = useStyle();

  const getTypographyStyle = useCallback(
    (key = typographyConfig.default): TextStyle => {
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
