import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledView, Styler } from '@mapples/style';
import { StyleSheet, View } from 'react-native';

import type { CodeScannerProps } from './CodeScanner';
import { assertCodeScannerProps, CODE_SCANNER_INTERVAL } from './types';

// `expo-camera` is an optional peer: an app without a scanner does not
// install it (or ask for the camera). Loaded when the module loads, asked
// for when a scanner renders.
let Camera: typeof import('expo-camera') | null = null;
let cameraLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Camera = require('expo-camera');
} catch (error) {
  cameraLoadError = error;
}

const requireCamera = () => {
  if (!Camera) {
    throw new Error(
      'CodeScanner: expo-camera could not be loaded (the "Camera" package). ' +
        'Creator-first app: enable it in Project settings → Packages. ' +
        'Code-first app: run `mapples sync` (it adds the package to package.json), ' +
        'then the install command the sync names; rebuild the native app afterwards. ' +
        `Cause: ${String(cameraLoadError)}`,
    );
  }
  return Camera;
};

/**
 * The camera scanner of iOS and Android; see `CodeScanner.tsx` for the
 * component's description. It asks for the camera when it first renders;
 * until the answer (and after a refusal, which fires `onPermissionDenied`)
 * the box stays dark with the children on top.
 */
const CodeScanner: ForwardRefExoticComponent<
  PropsWithChildren<CodeScannerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CodeScannerProps>>(
  (
    {
      active = true,
      torch = false,
      codeTypes = ['qr'],
      scanInterval = CODE_SCANNER_INTERVAL,
      // Only the stand-in reports a sample.
      sampleValue: _sampleValue,
      onScan,
      onPermissionDenied,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    assertCodeScannerProps({ codeTypes, scanInterval });

    const { CameraView, useCameraPermissions } = requireCamera();
    const [permission, requestPermission] = useCameraPermissions();
    const lastScanAt = useRef(0);

    const granted = permission?.granted === true;
    const undecided = permission != null && !granted && permission.canAskAgain;
    const refused = permission != null && !granted && !permission.canAskAgain;

    useEffect(() => {
      if (undecided) void requestPermission();
    }, [requestPermission, undecided]);

    useEffect(() => {
      if (refused) onPermissionDenied?.();
      // The refusal is reported once, not each time the handler changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refused]);

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {granted && active ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={torch}
            barcodeScannerSettings={{ barcodeTypes: codeTypes }}
            onBarcodeScanned={({ data, type }) => {
              const now = Date.now();
              if (now - lastScanAt.current < scanInterval) return;
              lastScanAt.current = now;
              onScan?.(data, type);
            }}
          />
        ) : null}
        {children}
      </StyledView>
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
});

export default CodeScanner;
