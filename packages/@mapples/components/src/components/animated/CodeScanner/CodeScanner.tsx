import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledPressable, StyledProp, Styler } from '@mapples/style';
import { View, ViewProps, ViewStyle } from 'react-native';

import {
  assertCodeScannerProps,
  CODE_SCANNER_SAMPLE,
  CodeScannerBaseProps,
} from './types';

/** Props for {@link CodeScanner}. */
export interface CodeScannerProps extends ViewProps, CodeScannerBaseProps {
  /** Styled slots for every visual part. */
  styled?: {
    /** The scanner's box; children are laid over the camera inside it. */
    style?: StyledProp<ViewStyle>;
  };
}

/**
 * Reads QR codes and barcodes with the device camera and reports each one
 * through `onScan`. Its children are drawn over the camera picture (a
 * frame, a scan line, a hint), so the screen is designed like any other.
 *
 * This is the stand-in used where there is no camera to design against:
 * the web, which covers the Creator's canvas and Play in the browser. It is
 * a dark surface with the same children, and a press on it reports
 * `sampleValue`, so a scan flow can be played through. On iOS and Android
 * `CodeScanner.native.tsx` shows the camera.
 *
 * @example
 * ```tsx
 * <CodeScanner torch={flashOn} onScan={(code) => redeem(code)}>
 *   <ScanFrame />
 * </CodeScanner>
 * ```
 *
 * @public
 */
const CodeScanner: ForwardRefExoticComponent<
  PropsWithChildren<CodeScannerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CodeScannerProps>>(
  (
    {
      active = true,
      torch = false,
      codeTypes,
      scanInterval,
      sampleValue = CODE_SCANNER_SAMPLE,
      onScan,
      // No camera here, so nobody can refuse it.
      onPermissionDenied: _onPermissionDenied,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    assertCodeScannerProps({ codeTypes, scanInterval });

    return (
      <StyledPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel="Code scanner (sample): press to scan"
        disabled={!active}
        onPress={() => onScan?.(sampleValue, codeTypes?.[0] ?? 'qr')}
        styled={{
          style: [defaults.root, torch && defaults.torch, styled?.style],
        }}
        {...rest}
      >
        {children}
      </StyledPressable>
    );
  },
);
CodeScanner.displayName = 'CodeScanner';

const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    minHeight: 240,
    overflow: 'hidden',
    backgroundColor: '#0C0F0D',
  },
  /** The light on: the picture warms a little. */
  torch: {
    backgroundColor: '#2A2413',
  },
});

export default CodeScanner;
