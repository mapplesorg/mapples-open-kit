import { forwardRef, PropsWithChildren, ReactElement, useMemo } from 'react';

import {
  StyledProp,
  StyledProps,
  StyledView,
  Styler,
  WithStyledProps,
} from '@mapples/style';
import { View, ViewProps } from 'react-native';
import Svg, { Rect, SvgProps } from 'react-native-svg';

import BarcodeEncoder, { type BarcodeFormat } from './BarCodeEncoder';

/**
 * Props for the BarCode component.
 *
 * @public
 */
export type BarCodeProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    /** Styling configuration for the barcode container and SVG */
    styled?: StyledProps<ViewProps> & {
      /** SVG-specific styling */
      styleSvg?: StyledProp<SvgProps>;
    };
    /** The value to encode as a barcode */
    value?: string;
    /** Height of the barcode bars */
    height?: number;
    /** Width of each bar module */
    width?: number;
    /** Background color of the barcode */
    backgroundColor?: string;
    /** Foreground color of the barcode bars */
    foregroundColor?: string;
    /** Barcode format (default: CODE128) */
    format?: BarcodeFormat;
  }
>;

/**
 * Generates barcode pattern using BarcodeEncoder
 * Returns the encoded data and dimensions, or `null` when there is no value to
 * encode. An unencodable value is an authoring error: {@link BarcodeEncoder}
 * throws a descriptive error and it is left to propagate, because a barcode
 * that silently renders blank is a defect the author never gets to see.
 */
const generateBarcodeData = (
  value: string,
  format: BarcodeFormat = 'CODE128',
  barWidth: number = 2,
): {
  bars: { x: number; width: number }[];
  totalWidth: number;
} | null => {
  if (!value) return null;

  const encoded = BarcodeEncoder.encode(value, format, {});

  if (!encoded) {
    throw new Error(
      `Barcode encoder returned no data (format: ${format}, value: ${value})`,
    );
  }

  const bars: { x: number; width: number }[] = [];
  let x = 0;

  // Handle array response (EAN13, EAN8, UPC)
  if (Array.isArray(encoded)) {
    // Concatenate all segment data strings
    for (const segment of encoded) {
      if (segment && segment.data) {
        for (let i = 0; i < segment.data.length; i++) {
          const digit = segment.data[i];
          if (digit === '1') {
            bars.push({ x, width: barWidth });
          }
          x += barWidth;
        }
      }
    }
  } else {
    // Handle single object response (CODE128, CODE39, etc.)
    if (encoded.data) {
      for (let i = 0; i < encoded.data.length; i++) {
        const digit = encoded.data[i];
        if (digit === '1') {
          bars.push({ x, width: barWidth });
        }
        x += barWidth;
      }
    }
  }

  return {
    bars,
    totalWidth: x,
  };
};

/**
 * Renders barcode bars from barcode data
 */
const renderBarcodeBars = (
  bars: { x: number; width: number }[],
  height: number,
  foregroundColor: string,
): ReactElement[] => {
  return bars.map((bar, index) => (
    <Rect
      key={index}
      x={bar.x}
      y={0}
      width={bar.width}
      height={height}
      fill={foregroundColor}
    />
  ));
};

/**
 * A customizable barcode component with built-in styling support.
 *
 * The BarCode component renders a barcode using BarcodeEncoder for generation
 * and react-native-svg for rendering. It supports customizable styling
 * through the @mapples/style system.
 *
 * @example
 * ```tsx
 * <BarCode
 *   value="123456789"
 *   height={100}
 *   width={2}
 *   styled={{
 *     style: {
 *       width: 300,
 *       height: 100,
 *       alignItems: 'center',
 *       justifyContent: 'center',
 *     },
 *   }}
 * />
 * ```
 *
 * @public
 */
const BarCode = forwardRef<View, BarCodeProps>(
  (
    {
      styled,
      value = '',
      height = 100,
      width = 2,
      backgroundColor = 'transparent',
      foregroundColor = '#000000',
      format = 'CODE128',
      ...props
    },
    ref,
  ) => {
    const { styleSvg, ...styledProps } = styled || {};

    const barcodeData = useMemo(
      () => generateBarcodeData(value, format, width),
      [value, format, width],
    );

    const bars = useMemo(() => {
      if (!barcodeData) return [];
      return renderBarcodeBars(barcodeData.bars, height, foregroundColor);
    }, [barcodeData, height, foregroundColor]);

    const svgStyle = useMemo(() => {
      const flattened = styleSvg ? Styler.flatten(styleSvg) : {};
      return {
        backgroundColor,
        ...(flattened as Record<string, unknown>),
      };
    }, [styleSvg, backgroundColor]);

    if (!barcodeData || bars.length === 0) {
      return (
        <StyledView ref={ref} styled={styledProps} {...props}>
          {/* Empty state - no barcode to display */}
        </StyledView>
      );
    }

    return (
      <StyledView ref={ref} styled={styledProps} {...props}>
        <Svg
          width={barcodeData.totalWidth}
          height={height}
          viewBox={`0 0 ${barcodeData.totalWidth} ${height}`}
          style={svgStyle as never}
        >
          {bars}
        </Svg>
      </StyledView>
    );
  },
);
BarCode.displayName = 'BarCode';

export default BarCode;
