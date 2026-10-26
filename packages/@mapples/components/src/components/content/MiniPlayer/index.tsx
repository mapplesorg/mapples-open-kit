import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import {
  StyledImage,
  StyledPressable,
  StyledProp,
  StyledView,
  SvgStyle,
  Typography,
} from '@mapples/style';
import {
  IconButton,
  Tokens,
  Tone,
  TYPOGRAPHY_PARTS,
  useElevation,
  useShape,
  useTones,
} from '@mapples/ui';
import { ImageProps } from 'expo-image';
import {
  ImageStyle,
  PressableProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { useInteractionState, useSlotColor } from '../../../internal';
import SkipButton from '../PlaybackControls/SkipButton';
import {
  PLAYBACK_CONTROLS_ICON_NAMES,
  PlaybackControlsIconNames,
} from '../PlaybackControls/types';

import { defaults } from './defaults';
import { MINI_PLAYER_GEOMETRY, MiniPlayerVariant } from './types';

/** Props for {@link MiniPlayer}. */
export interface MiniPlayerProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  /** Cover art (a uri string or an expo-image source); a tinted square shows without one. */
  artwork?: ImageProps['source'];
  /** What is playing (the episode or track title). */
  title?: string;
  /** Secondary line, such as the show or artist. */
  subtitle?: string;
  /** Played share of the track, `0..1`, from the app's player; drawn as a 2 pt line on the bottom edge. Omitted, no line shows. */
  progress?: number;
  /** Whether the app's player is playing: the button shows pause while `true`, play while `false`. */
  playing?: boolean;
  /** Fires when the play/pause button is pressed; the bar's own `onPress` does not fire. */
  onPlayPause?: () => void;
  /** Adds a skip-forward button with this step, in whole seconds, drawn inside its arrow. */
  skipForwardSeconds?: number;
  /** Fires when the skip-forward button is pressed; the app moves its player on by `skipForwardSeconds`. */
  onSkipForward?: () => void;
  /** Fires when the bar itself is pressed — open the full player. */
  onPress?: PressableProps['onPress'];
  /** `surface` (card surface with a shadow) or `tonal` (tinted with the tone). Defaults to `surface`. */
  variant?: MiniPlayerVariant;
  /** Colour role of the progress line and the tonal surface. Defaults to `primary`. */
  tone?: Tone;
  /** Project-family glyphs ({ play, pause, skipForward }); defaults are Ionicons names, as in `PlaybackControls`. */
  iconNames?: Pick<PlaybackControlsIconNames, 'play' | 'pause' | 'skipForward'>;
  /** Styled slots for every visual part. */
  styled?: {
    /** The bar. */
    style?: StyledProp<ViewStyle>;
    /** The cover art (or its placeholder square). */
    styleArtwork?: StyledProp<ImageStyle>;
    /** The title. */
    styleTitle?: StyledProp<TextStyle>;
    /** The subtitle. */
    styleSubtitle?: StyledProp<TextStyle>;
    /** The play/pause and skip buttons. */
    styleButton?: StyledProp<ViewStyle>;
    /** The button glyphs; `color` paints them and the skip number. */
    styleIcon?: StyledProp<SvgStyle>;
    /** The progress track along the bottom edge. */
    styleProgress?: StyledProp<ViewStyle>;
    /** The played part of the progress line. */
    styleProgressFilled?: StyledProp<ViewStyle>;
  };
}

/**
 * The persistent now-playing bar of a podcast, music or meditation app,
 * usually docked above the tab bar: cover art, title and subtitle, a
 * play/pause button, an optional skip-forward button and a thin progress line
 * on the bottom edge. Pressing the bar opens the full player (`onPress`); the
 * buttons do not trigger it. With `onPress` the bar's press target is a
 * full-size sibling behind the content, never an ancestor of the buttons
 * (on web a `<button>` inside a `<button>` is invalid HTML); the
 * pressable's props go to that target, the `ref` to the bar.
 *
 * A controlled UI component with no audio engine — the app owns playback,
 * passes `playing` and `progress` and handles `onPlayPause` and
 * `onSkipForward` itself.
 *
 * @example
 * ```tsx
 * <MiniPlayer
 *   artwork={{ uri: episode.coverUrl }}
 *   title={episode.title}
 *   subtitle={episode.show}
 *   progress={player.position / player.duration}
 *   playing={player.playing}
 *   onPlayPause={player.toggle}
 *   skipForwardSeconds={30}
 *   onSkipForward={() => player.seekBy(30)}
 *   onPress={openPlayer}
 * />
 * ```
 *
 * @public
 */
const MiniPlayer: ForwardRefExoticComponent<
  PropsWithChildren<MiniPlayerProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<MiniPlayerProps>>(
  (
    {
      artwork,
      title,
      subtitle,
      progress,
      playing = false,
      onPlayPause,
      skipForwardSeconds,
      onSkipForward,
      onPress,
      onPressIn,
      onPressOut,
      onHoverIn,
      onHoverOut,
      disabled,
      variant = 'surface',
      tone = 'primary',
      iconNames,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    if (
      progress !== undefined &&
      !(Number.isFinite(progress) && progress >= 0 && progress <= 1)
    ) {
      throw new Error(
        `MiniPlayer: progress must be a number in 0..1 (got ${progress})`,
      );
    }
    if (
      skipForwardSeconds !== undefined &&
      !(Number.isInteger(skipForwardSeconds) && skipForwardSeconds > 0)
    ) {
      throw new Error(
        `MiniPlayer: skipForwardSeconds must be a whole number of seconds > 0 (got ${skipForwardSeconds})`,
      );
    }

    const tones = useTones();
    const shape = useShape();
    const elevation = useElevation();
    const palette = tones.tone(tone);
    const interactive = !!onPress;
    const interaction = useInteractionState(
      { onPressIn, onPressOut, onHoverIn, onHoverOut },
      !!disabled,
    );

    const tonal = variant === 'tonal';
    const text = tonal ? palette.onContainer : tones.resolve(Tokens.color.text);
    const secondary = tonal
      ? palette.onContainer
      : tones.resolve(Tokens.color.textSecondary);
    const glyphColor = useSlotColor(styled?.styleIcon, 'color', text);
    const { artwork: artworkSize, glyph, skipLabel } = MINI_PLAYER_GEOMETRY;
    const playKey = playing ? 'pause' : 'play';
    const playIconName =
      iconNames?.[playKey] ?? PLAYBACK_CONTROLS_ICON_NAMES[playKey];
    const skipIconName = iconNames?.skipForward;

    const style = [
      defaults.root,
      {
        borderRadius: shape.radius.md,
        backgroundColor: tonal
          ? palette.container
          : tones.resolve(Tokens.color.surface),
        borderWidth: !tonal && tones.isDark ? shape.borderWidth(1) : 0,
        borderColor: tones.outline,
      },
      !tonal && { boxShadow: elevation },
      styled?.style,
    ];

    // Presses on the art and text fall through to the press target behind them.
    const passThrough = interactive ? ('none' as const) : undefined;

    const artworkGeometry = {
      width: artworkSize,
      height: artworkSize,
      borderRadius: shape.radius.sm,
    };

    const body = (
      <>
        {artwork ? (
          <StyledImage
            source={artwork}
            contentFit="cover"
            accessible={false}
            pointerEvents={passThrough}
            styled={{
              style: [defaults.artwork, artworkGeometry, styled?.styleArtwork],
            }}
          />
        ) : (
          <StyledView
            pointerEvents={passThrough}
            styled={{
              style: [
                artworkGeometry,
                { backgroundColor: tonal ? palette.main : tones.fill },
                styled?.styleArtwork,
              ],
            }}
          />
        )}
        <StyledView
          pointerEvents={passThrough}
          styled={{ style: defaults.text }}
        >
          {title ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.label}
              numberOfLines={1}
              style={[{ color: text }, styled?.styleTitle]}
            >
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography
              variant={TYPOGRAPHY_PARTS.helper}
              numberOfLines={1}
              style={[{ color: secondary }, styled?.styleSubtitle]}
            >
              {subtitle}
            </Typography>
          ) : null}
        </StyledView>
        <StyledView
          pointerEvents={interactive ? 'box-none' : undefined}
          styled={{ style: defaults.actions }}
        >
          <IconButton
            iconName={playIconName}
            variant="standard"
            size="md"
            tone={tone}
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            onPress={onPlayPause}
            styled={{
              style: styled?.styleButton,
              styleSvg: [
                { width: glyph, color: glyphColor },
                styled?.styleIcon,
              ],
            }}
          />
          {skipForwardSeconds !== undefined ? (
            <SkipButton
              iconName={
                skipIconName ?? PLAYBACK_CONTROLS_ICON_NAMES.skipForward
              }
              mirrored={false}
              seconds={skipForwardSeconds}
              size="md"
              glyphSize={glyph}
              labelSize={skipLabel}
              color={glyphColor}
              tone={tone}
              accessibilityLabel={`Skip forward ${skipForwardSeconds} seconds`}
              onPress={onSkipForward}
              style={styled?.styleButton}
            />
          ) : null}
        </StyledView>
        {progress !== undefined ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.progressTrack,
                {
                  height: MINI_PLAYER_GEOMETRY.progress,
                  backgroundColor: tonal ? tones.outline : tones.fill,
                },
                styled?.styleProgress,
              ],
            }}
          >
            <StyledView
              styled={{
                style: [
                  defaults.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: palette.main,
                  },
                  styled?.styleProgressFilled,
                ],
              }}
            />
          </StyledView>
        ) : null}
        {interactive && (interaction.pressed || interaction.hovered) ? (
          <StyledView
            pointerEvents="none"
            styled={{
              style: [
                defaults.stateLayer,
                {
                  backgroundColor: tones.stateLayer(
                    text,
                    interaction.pressed ? 'pressed' : 'hover',
                  ),
                },
              ],
            }}
          />
        ) : null}
      </>
    );

    if (interactive) {
      return (
        <StyledView ref={ref} styled={{ style }}>
          <StyledPressable
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint="Opens the player"
            onPress={onPress}
            disabled={disabled}
            {...interaction.handlers}
            styled={{ style: defaults.pressSurface }}
            {...rest}
          />
          {body}
        </StyledView>
      );
    }

    return (
      <StyledView ref={ref} styled={{ style }} {...rest}>
        {body}
      </StyledView>
    );
  },
);
MiniPlayer.displayName = 'MiniPlayer';

export default MiniPlayer;
