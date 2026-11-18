import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledView, Styler, useLiveMedia } from '@mapples/style';
import { StyleSheet, View } from 'react-native';

import type { CameraViewProps } from './CameraView';
import { assertCameraViewProps } from './types';

// `expo-camera` is an optional peer: an app without a camera does not
// install it (or ask for the camera). Loaded when the module loads, asked
// for when a camera view renders.
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
      'CameraView: expo-camera could not be loaded (the "Camera" package). ' +
        'Creator-first app: enable it in Project settings → Packages. ' +
        'Code-first app: run `mapples sync` (it adds the package to package.json), ' +
        'then the install command the sync names; rebuild the native app afterwards. ' +
        `Cause: ${String(cameraLoadError)}`,
    );
  }
  return Camera;
};

/**
 * The camera view of iOS and Android; see `CameraView.tsx` for the
 * component's description. It asks for the camera when it first renders
 * with live media on; until the answer (and after a refusal, which fires
 * `onPermissionDenied`) the box stays black with the children on top.
 */
const CameraView: ForwardRefExoticComponent<
  PropsWithChildren<CameraViewProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CameraViewProps>>(
  (props, ref) => {
    const live = useLiveMedia();
    assertCameraViewProps({ facing: props.facing });
    return live ? (
      <LiveCamera {...props} ref={ref} />
    ) : (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, props.styled?.style] }}
        {...withoutCameraProps(props)}
      >
        {props.children}
      </StyledView>
    );
  },
);
CameraView.displayName = 'CameraView';

/** The props left for the box once the camera's own are taken out. */
const withoutCameraProps = ({
  active: _active,
  facing: _facing,
  mirror: _mirror,
  onPermissionDenied: _onPermissionDenied,
  styled: _styled,
  children: _children,
  ...rest
}: PropsWithChildren<CameraViewProps>) => rest;

/** The camera itself, rendered only where live media is on. */
const LiveCamera = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<CameraViewProps>
>((props, ref) => {
  const {
    active = true,
    facing = 'back',
    mirror,
    onPermissionDenied,
    styled,
    children,
  } = props;
  const { CameraView: ExpoCameraView, useCameraPermissions } = requireCamera();
  const [permission, requestPermission] = useCameraPermissions();

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
      {...withoutCameraProps(props)}
    >
      {granted && active ? (
        <ExpoCameraView
          style={StyleSheet.absoluteFill}
          facing={facing}
          mirror={mirror ?? facing === 'front'}
          active={active}
        />
      ) : null}
      {children}
    </StyledView>
  );
});
LiveCamera.displayName = 'LiveCamera';

const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    minHeight: 240,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
});

export default CameraView;
