import { forwardRef, PropsWithChildren, useEffect } from 'react';

import { styled, StyledProps, StyledView, StyledProp } from '@mapples/style';
import { useVideoPlayer, VideoView, VideoContentFit } from 'expo-video';
import { View, ViewProps, ViewStyle } from 'react-native';

export type VideoProps = PropsWithChildren<ViewProps> & {
  source?: string;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  contentFit?: VideoContentFit;
  styled?: StyledProps<ViewProps> & {
    styleVideo?: StyledProp<ViewStyle>;
  };
};

const StyledVideo = styled(VideoView);

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
