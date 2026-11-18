import {
  createElement,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, Styler, useLiveMedia } from '@mapples/style';
import { View, ViewProps, ViewStyle } from 'react-native';

import { assertCameraViewProps, CameraViewBaseProps } from './types';

/** Props for {@link CameraView}. */
export interface CameraViewProps extends ViewProps, CameraViewBaseProps {
  /** Styled slots for every visual part. */
  styled?: {
    /** The camera's box; children are laid over the picture inside it. */
    style?: StyledProp<ViewStyle>;
  };
}

const VIDEO_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const;

/**
 * Shows the live picture of the device camera. Its children are drawn over
 * the picture (a frame, a hint, a shutter button), so the screen is designed
 * like any other.
 *
 * Where live media is off (a design canvas wraps its screens in
 * `<LiveMediaProvider enabled={false}>`) it is a black box with the same
 * children and asks for nothing. Elsewhere on the web (Play in the browser,
 * a web app) it shows the webcam through `getUserMedia`; on iOS and Android
 * `CameraView.native.tsx` shows the camera through `expo-camera`.
 *
 * @example
 * ```tsx
 * <CameraView facing="front" onPermissionDenied={() => setNoCamera(true)}>
 *   <ShutterButton />
 * </CameraView>
 * ```
 *
 * @public
 */
const CameraView: ForwardRefExoticComponent<
  PropsWithChildren<CameraViewProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<CameraViewProps>>(
  (
    {
      active = true,
      facing = 'back',
      mirror,
      onPermissionDenied,
      styled,
      children,
      ...rest
    },
    ref,
  ) => {
    assertCameraViewProps({ facing });

    const live = useLiveMedia() && active;
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [failure, setFailure] = useState<Error | null>(null);
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
      if (!live) return;
      const devices =
        typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
      if (!devices?.getUserMedia) {
        setFailure(
          new Error(
            'CameraView: this browser gives no camera access (navigator.mediaDevices is missing; ' +
              'the page must be served over https or from localhost).',
          ),
        );
        return;
      }

      // The <video> is mounted with live media on, so it is there by now.
      const video = videoRef.current;
      let stream: MediaStream | null = null;
      let cancelled = false;
      devices
        .getUserMedia({
          video: { facingMode: facing === 'front' ? 'user' : 'environment' },
          audio: false,
        })
        .then((granted) => {
          if (cancelled) {
            granted.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = granted;
          if (video) {
            video.srcObject = granted;
            void video.play();
          }
          setStreaming(true);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          const name = (error as { name?: string })?.name;
          if (name === 'NotAllowedError' || name === 'SecurityError') {
            onPermissionDenied?.();
            return;
          }
          setFailure(
            new Error(
              `CameraView: the camera could not start (${String(error)})`,
            ),
          );
        });

      return () => {
        cancelled = true;
        stream?.getTracks().forEach((track) => track.stop());
        if (video) video.srcObject = null;
        setStreaming(false);
      };
      // The refusal handler is read when the answer comes, not a reason to
      // ask for the camera again.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [live, facing]);

    // A camera that cannot start for any reason but a refusal is an error
    // the screen must show, not a silent black box.
    if (failure) throw failure;

    const mirrored = mirror ?? facing === 'front';

    return (
      <StyledView
        ref={ref}
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {live
          ? createElement('video', {
              ref: videoRef,
              autoPlay: true,
              muted: true,
              playsInline: true,
              style: {
                ...VIDEO_STYLE,
                opacity: streaming ? 1 : 0,
                transform: mirrored ? 'scaleX(-1)' : undefined,
              },
            })
          : null}
        {children}
      </StyledView>
    );
  },
);
CameraView.displayName = 'CameraView';

const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    minHeight: 240,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
});

export default CameraView;
