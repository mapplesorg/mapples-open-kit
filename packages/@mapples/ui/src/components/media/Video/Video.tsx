import {
  forwardRef,
  PropsWithChildren,
  useEffect,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { styled, StyledProps, StyledView, StyledProp } from '@mapples/style';
import type { VideoContentFit } from 'expo-video';
import { View, ViewProps, ViewStyle } from 'react-native';

/**
 * `expo-video` is an **optional peer dependency** of `@mapples/ui` (Project
 * settings → Packages → "Video"): it's a native module, so apps without a
 * video element shouldn't have to install it. Resolved lazily; when absent,
 * rendering a Video throws — nothing is drawn in its place.
 */
let ExpoVideo: typeof import('expo-video') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ExpoVideo = require('expo-video');
} catch {
  ExpoVideo = null;
}

/**
 * Props for the Video component.
 *
 * @public
 */
export type VideoProps = PropsWithChildren<ViewProps> & {
  /** URI of the video to play */
  source?: string;
  /** Whether playback should start automatically once the source is ready */
  autoPlay?: boolean;
  /** Whether the video should loop when it reaches the end */
  loop?: boolean;
  /** Whether native playback controls (play/pause, seek bar) are shown */
  controls?: boolean;
  /** How the video should be scaled within its bounds (e.g. `"contain"`, `"cover"`) */
  contentFit?: VideoContentFit;
  /** Styling configuration for the video container and the underlying video view */
  styled?: StyledProps<ViewProps> & {
    /** Styling applied directly to the `VideoView` element */
    styleVideo?: StyledProp<ViewStyle>;
  };
};

const StyledVideo = ExpoVideo ? styled(ExpoVideo.VideoView) : null;

const requireExpoVideo = (): typeof import('expo-video') => {
  if (!ExpoVideo) {
    throw new Error(
      'Video needs expo-video: enable the "Video" package in Project ' +
        'settings → Packages.',
    );
  }
  return ExpoVideo;
};

/**
 * A customizable video player component with built-in styling support.
 *
 * The Video component wraps Expo's `VideoView` and `useVideoPlayer` hook,
 * exposing common playback options (`autoPlay`, `loop`, `controls`) as props.
 * Container and video-specific styling are handled through the `@mapples/style`
 * system via the `styled` prop.
 *
 * @example
 * ```tsx
 * <Video
 *   source="https://example.com/video.mp4"
 *   autoPlay
 *   loop
 *   controls
 *   contentFit="cover"
 *   styled={{
 *     style: { width: '100%', height: 240 },
 *     styleVideo: { borderRadius: 8 },
 *   }}
 * />
 * ```
 *
 * @public
 */
const Video: ForwardRefExoticComponent<
  VideoProps & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, VideoProps>(
  ({ styled, source, autoPlay, loop, controls, contentFit, ...props }, ref) => {
    // Resolved before the hook so a missing package throws a clear error
    // instead of a hooks-order crash.
    const { useVideoPlayer } = requireExpoVideo();
    const player = useVideoPlayer(source || '');

    const { styleVideo, ...styledProps } = styled || {};

    useEffect(() => {
      if (source) {
        player.loop = !!loop;
      }
    }, [loop, player, source]);

    useEffect(() => {
      if (source && autoPlay) {
        setTimeout(() => {
          player.play();
        }, 1000);
      }
    }, [autoPlay, player, source]);

    return (
      <StyledView ref={ref} styled={styledProps} {...props}>
        {StyledVideo && (
          <StyledVideo
            player={player}
            styled={{ style: styleVideo }}
            nativeControls={controls}
            contentFit={contentFit}
          />
        )}
      </StyledView>
    );
  },
);
Video.displayName = 'Video';

export default Video;
