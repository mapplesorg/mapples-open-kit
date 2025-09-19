/**
 * @fileoverview Type declarations for SVG modules
 *
 * This file provides TypeScript declarations for SVG imports,
 * allowing SVG files to be imported as React components.
 *
 * @public
 */

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
