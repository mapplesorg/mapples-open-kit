import { forwardRef, PropsWithChildren, useEffect } from 'react';

import { styled, StyledProps, StyledView, StyledProp } from '@mapples/style';
import { useVideoPlayer, VideoView, VideoContentFit } from 'expo-video';
import { View, ViewProps, ViewStyle } from 'react-native';

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

const StyledVideo = styled(VideoView);

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
const Video = forwardRef<View, VideoProps>(
  ({ styled, source, autoPlay, loop, controls, contentFit, ...props }, ref) => {
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
        <StyledVideo
          player={player}
          styled={{ style: styleVideo }}
          nativeControls={controls}
          contentFit={contentFit}
        />
      </StyledView>
    );
  },
);
Video.displayName = 'Video';

export default Video;
