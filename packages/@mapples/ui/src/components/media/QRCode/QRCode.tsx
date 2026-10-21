import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledProp,
  StyledProps,
  StyledView,
  WithStyledProps,
} from '@mapples/style';
import { View, ViewProps } from 'react-native';
import type { default as QRCodeSvgType } from 'react-native-qrcode-svg';
import { SvgProps } from 'react-native-svg';

/**
 * `react-native-qrcode-svg` is an **optional peer dependency** of `@mapples/ui`
 * (Project settings → Packages → "QR code"): it's resolved lazily so apps that
 * never render a QR code don't have to install it. When absent, rendering a
 * QR code with a value throws — nothing is drawn in its place.
 */
let QRCodeSvg: typeof QRCodeSvgType | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  QRCodeSvg = require('react-native-qrcode-svg').default;
} catch {
  QRCodeSvg = null;
}

/**
 * Props for the QRCode component.
 *
 * @public
 */
export type QRCodeProps = PropsWithChildren<
  Omit<WithStyledProps<ViewProps>, 'styled'> & {
    /** Styling configuration for the QR code container and SVG */
    styled?: StyledProps<ViewProps> & {
      /** SVG-specific styling */
      styleSvg?: StyledProp<SvgProps>;
    };
    /** The value to encode as a QR code */
    value?: string;
    /** Size of the QR code (width and height) */
    size?: number;
    /** Background color of the QR code */
    backgroundColor?: string;
    /** Foreground color of the QR code */
    color?: string;
    /** Error correction level */
    ecl?: 'L' | 'M' | 'Q' | 'H';
    /** Logo to display in the center of the QR code */
    logo?: string;
    /** Size of the logo */
    logoSize?: number;
    /** Margin around the QR code */
    quietZone?: number;
  }
>;

/**
 * A customizable QR code component with built-in styling support.
 *
 * The QRCode component renders a QR code using react-native-svg.
 * It supports customizable styling through the @mapples/style system.
 *
 * @example
 * ```tsx
 * <QRCode
 *   value="https://example.com"
 *   size={200}
 *   styled={{
 *     style: {
 *       width: 200,
 *       height: 200,
 *       alignItems: 'center',
 *       justifyContent: 'center',
 *     },
 *   }}
 * />
 * ```
 *
 * @public
 */
const QRCode: ForwardRefExoticComponent<
  QRCodeProps & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, QRCodeProps>(
  (
    {
      styled,
      value = '',
      size = 200,
      backgroundColor = '#FFFFFF',
      color = '#000000',
      ecl = 'M',
      logo,
      logoSize,
      quietZone,
      ...props
    },
    ref,
  ) => {
    const { styleSvg, ...styledProps } = styled || {};

    if (value && !QRCodeSvg) {
      throw new Error(
        'QRCode needs react-native-qrcode-svg: enable the "QR code" package ' +
          'in Project settings → Packages.',
      );
    }

    return (
      <StyledView ref={ref} styled={styledProps} {...props}>
        {value && QRCodeSvg && (
          <QRCodeSvg
            value={value}
            size={size}
            color={color}
            backgroundColor={backgroundColor}
            ecl={ecl}
            logo={logo ? { uri: logo } : undefined}
            logoSize={logoSize}
            quietZone={quietZone}
          />
        )}
      </StyledView>
    );
  },
);
QRCode.displayName = 'QRCode';

export default QRCode;
