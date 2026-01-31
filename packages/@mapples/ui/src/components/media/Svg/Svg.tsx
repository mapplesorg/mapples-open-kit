import { forwardRef } from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { View, ViewProps } from 'react-native';
import { SvgProps as RnsSvgProps, SvgUri } from 'react-native-svg';

const StyledSvgUri = styled(SvgUri);

/**
 * Props for the Svg component.
 *
 * @public
 */
export type SvgProps = WithStyledProps<ViewProps> & {
  /** Styling configuration for the container and SVG */
  styled?: StyledProps<ViewProps> & {
    /** SVG-specific styling (width, height, color) */
    styleSvg?: StyledProp<RnsSvgProps>;
  };
  /** SVG markup string (e.g. from Figma vector group conversion) */
  content?: string;
};

/**
 * Renders inline SVG from a string (e.g. from @mapplesorg/figmafile GROUP→Svg conversion).
 * Uses a data URI so react-native-svg's SvgUri can display it.
 *
 * @example
 * ```tsx
 * <Svg
 *   content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="#333"/></svg>'
 *   styled={{ style: { width: 100, height: 100 }, styleSvg: { width: 100, height: 100 } }}
 * />
 * ```
 *
 * @public
 */
const Svg = forwardRef<View, SvgProps>(({ styled, content, ...props }, ref) => {
  const { styleSvg, style, ...styledProps } = styled || {};

  const uri =
    content && content.trim().length > 0
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content.trim())}`
      : undefined;

  const svgStyle = styleSvg ?? style;

  return (
    <StyledView ref={ref} styled={{ style, ...styledProps }} {...props}>
      {uri ? (
        <StyledSvgUri uri={uri} styled={{ style: svgStyle }} />
      ) : (
        <StyledView styled={{ style: styler.placeholder }} />
      )}
    </StyledView>
  );
});
Svg.displayName = 'Svg';

const styler = Styler.create({
  placeholder: {
    width: '100%',
    height: '100%',
    minHeight: 48,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Svg;
