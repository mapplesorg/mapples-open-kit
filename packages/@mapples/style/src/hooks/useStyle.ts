import { useContext } from 'react';

import { StyleContext } from '../context';
import { StyleContextType } from '../types';

/**
 * Hook to access the current style configuration from the StyleContext.
 *
 * @param customStyleConfig - Optional custom style configuration to override the context value
 * @returns The style configuration object containing theme, typography, sizing, and responsive settings
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const style = useStyle();
 *
 *   return (
 *     <View style={{ backgroundColor: style.themeConfig.light.primary }}>
 *       <Text>Styled content</Text>
 *     </View>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const customStyle = {
 *     themeConfig: { / custom theme / },
 *     typographyConfig: { / custom typography / }
 *   };
 *   const style = useStyle(customStyle);
 *
 *   return <Text>Using custom style</Text>;
 * };
 * ```
 */
const useStyle = (customStyleConfig?: StyleContextType) => {
  const style = useContext(StyleContext);

  return customStyleConfig ? customStyleConfig : style;
};

export default useStyle;
