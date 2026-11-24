import {
  forwardRef,
  useId,
  useMemo,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  styled,
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { Platform, View, ViewProps, ViewStyle } from 'react-native';
import { SvgProps as RnsSvgProps, SvgXml } from 'react-native-svg';

import { scopeSvgIds } from './scopeSvgIds';

const StyledSvgXml = styled(SvgXml);

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
 * Parses the markup with react-native-svg's SvgXml, so nothing is fetched (a data URI
 * through SvgUri falls back to `fetch`, which fails on Android).
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
const Svg: ForwardRefExoticComponent<
  SvgProps & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, SvgProps>(
  ({ styled, content, ...props }, ref) => {
    const { styleSvg, style, ...styledProps } = styled || {};

    // Ids are scoped to this element on the web, where inline SVGs share the
    // page's id space (see `scopeSvgIds`). On native each drawing is its own
    // document and the markup is left as written.
    const scope = `svg${useId().replace(/[^a-zA-Z0-9]/g, '')}-`;
    const xml = useMemo(() => {
      const markup = content?.trim();
      if (!markup) return undefined;
      return Platform.OS === 'web' ? scopeSvgIds(markup, scope) : markup;
    }, [content, scope]);

    const svgStyle = (styleSvg ?? style) as StyledProp<ViewStyle>;

    return (
      <StyledView ref={ref} styled={{ style, ...styledProps }} {...props}>
        {xml ? (
          <StyledSvgXml xml={xml} styled={{ style: svgStyle }} />
        ) : (
          <StyledView styled={{ style: styler.placeholder }} />
        )}
      </StyledView>
    );
  },
);
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
