import {
  forwardRef,
  PropsWithChildren,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from 'react';

import { StyledProp, StyledView, SvgStyle } from '@mapples/style';
import { IconButton, Tokens, Tone, useShape, useTones } from '@mapples/ui';
import { TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import { useSlotColor, useSlotSize } from '../../../internal';

import { defaults } from './defaults';
import SkipButton from './SkipButton';
import {
  PLAYBACK_CONTROLS_GEOMETRY,
  PLAYBACK_CONTROLS_ICON_NAMES,
  PLAYBACK_CONTROLS_MIRRORED_DEFAULTS,
  PLAYBACK_CONTROLS_SKIP_BACK_SECONDS,
  PLAYBACK_CONTROLS_SKIP_FORWARD_SECONDS,
  PlaybackControlsGlyph,
  PlaybackControlsIconNames,
  PlaybackControlsSize,
} from './types';

/** Props for {@link PlaybackControls}. */
export interface PlaybackControlsProps extends Omit<ViewProps, 'children'> {
  /** Whether the app's player is playing: the centre button shows pause while `true`, play while `false`. */
  playing?: boolean;
  /** Fires when the centre button is pressed; the app starts or pauses its player and passes the new `playing`. */
  onPlayPause?: () => void;
  /** Step of the skip-back button, in whole seconds, drawn inside its arrow. Defaults to `15`. */
  skipBackSeconds?: number;
  /** Step of the skip-forward button, in whole seconds, drawn inside its arrow. Defaults to `30`. */
  skipForwardSeconds?: number;
  /** Fires when skip back is pressed; the app moves its player back by `skipBackSeconds`. */
  onSkipBack?: () => void;
  /** Fires when skip forward is pressed; the app moves its player on by `skipForwardSeconds`. */
  onSkipForward?: () => void;
  /** Adds previous / next track buttons at the outer ends. */
  showPrevNext?: boolean;
  /** Fires when the previous button is pressed. */
  onPrevious?: () => void;
  /** Fires when the next button is pressed. */
  onNext?: () => void;
  /** Adds a restart (play from the start) button at the leading end. */
  showRestart?: boolean;
  /** Fires when the restart button is pressed. */
  onRestart?: () => void;
  /** `md` (64 pt play button) or `lg` (80 pt play button). Defaults to `md`. */
  size?: PlaybackControlsSize;
  /** Colour role of the play button. Defaults to `primary`. */
  tone?: Tone;
  /**
   * Project-family glyph per button ({ play, pause, skipBack, skipForward,
   * restart, previous, next }). Defaults are Ionicons names; the default
   * skip-back and restart arrows are clockwise glyphs drawn mirrored, a
   * named glyph is drawn as is.
   */
  iconNames?: PlaybackControlsIconNames;
  /** Styled slots for every visual part. */
  styled?: {
    /** The row. */
    style?: StyledProp<ViewStyle>;
    /** The play/pause button. */
    stylePlay?: StyledProp<ViewStyle>;
    /** Every secondary button (skip, restart, previous, next). */
    styleButton?: StyledProp<ViewStyle>;
    /** The glyphs of the secondary buttons; `color` paints them and the skip numbers. */
    styleIcon?: StyledProp<SvgStyle>;
    /** The number inside the skip arrows. */
    styleSkipLabel?: StyledProp<TextStyle>;
  };
}

const assertSeconds = (name: string, seconds: number) => {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(
      `PlaybackControls: ${name} must be a whole number of seconds > 0 (got ${seconds})`,
    );
  }
};

/**
 * The transport row of a podcast, audiobook or meditation player: skip back
 * N seconds, a large play/pause button and skip forward N seconds, with
 * optional previous/next track buttons and a restart button. A controlled UI
 * component with no audio engine — the app owns playback, passes `playing`
 * and handles `onPlayPause`, `onSkipBack`, `onSkipForward`, `onPrevious`,
 * `onNext` and `onRestart` itself.
 *
 * Glyphs come from the project icon family (Ionicons names by default,
 * renamable through `iconNames`); the skip steps are drawn as small numbers
 * inside the arrows.
 *
 * @example
 * ```tsx
 * <PlaybackControls
 *   playing={player.playing}
 *   onPlayPause={player.toggle}
 *   onSkipBack={() => player.seekBy(-15)}
 *   onSkipForward={() => player.seekBy(30)}
 *   size="lg"
 * />
 * ```
 *
 * @public
 */
const PlaybackControls: ForwardRefExoticComponent<
  PropsWithChildren<PlaybackControlsProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<PlaybackControlsProps>
>(
  (
    {
      playing = false,
      onPlayPause,
      skipBackSeconds = PLAYBACK_CONTROLS_SKIP_BACK_SECONDS,
      skipForwardSeconds = PLAYBACK_CONTROLS_SKIP_FORWARD_SECONDS,
      onSkipBack,
      onSkipForward,
      showPrevNext = false,
      onPrevious,
      onNext,
      showRestart = false,
      onRestart,
      size = 'md',
      tone = 'primary',
      iconNames,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    assertSeconds('skipBackSeconds', skipBackSeconds);
    assertSeconds('skipForwardSeconds', skipForwardSeconds);
    if (iconNames !== undefined) {
      for (const [key, name] of Object.entries(iconNames)) {
        if (!(key in PLAYBACK_CONTROLS_ICON_NAMES)) {
          throw new Error(
            `PlaybackControls: iconNames has an unknown key "${key}"`,
          );
        }
        if (typeof name !== 'string' || name.length === 0) {
          throw new Error(
            `PlaybackControls: iconNames.${key} must be a glyph name`,
          );
        }
      }
    }

    const tones = useTones();
    const shape = useShape();
    const geometry = PLAYBACK_CONTROLS_GEOMETRY[size];
    const glyphColor = useSlotColor(
      styled?.styleIcon,
      'color',
      tones.resolve(Tokens.color.text),
    );

    const glyph = (key: PlaybackControlsGlyph) => {
      const named = iconNames?.[key];
      return named === undefined
        ? {
            name: PLAYBACK_CONTROLS_ICON_NAMES[key],
            mirrored: PLAYBACK_CONTROLS_MIRRORED_DEFAULTS.has(key),
          }
        : { name: named, mirrored: false };
    };

    const iconStyle = (key: PlaybackControlsGlyph) => [
      { width: geometry.glyph, color: glyphColor },
      glyph(key).mirrored ? defaults.mirrored : undefined,
    ];

    const sideButton = (
      key: 'restart' | 'previous' | 'next',
      label: string,
      onPress: (() => void) | undefined,
    ) => (
      <IconButton
        iconName={glyph(key).name}
        variant="standard"
        size={geometry.button}
        tone={tone}
        accessibilityLabel={label}
        onPress={onPress}
        styled={{
          style: [defaults.button, styled?.styleButton],
          styleSvg: [iconStyle(key), styled?.styleIcon],
        }}
      />
    );

    const skipButton = (
      key: 'skipBack' | 'skipForward',
      seconds: number,
      onPress: (() => void) | undefined,
    ) => (
      <SkipButton
        iconName={glyph(key).name}
        mirrored={glyph(key).mirrored}
        seconds={seconds}
        size={geometry.button}
        glyphSize={geometry.glyph}
        labelSize={geometry.label}
        color={glyphColor}
        tone={tone}
        accessibilityLabel={`Skip ${key === 'skipBack' ? 'back' : 'forward'} ${seconds} seconds`}
        onPress={onPress}
        style={styled?.styleButton}
        styleLabel={styled?.styleSkipLabel}
      />
    );

    const playKey = playing ? 'pause' : 'play';
    // The play button is larger than any control size: it keeps a circle
    // unless the project is sharp (pill radius 0).
    const playCorner = Math.min(geometry.play / 2, shape.radius.pill);
    // A slot width overrides the side buttons' box, so the restart balance
    // spacer reads it too.
    const sideWidth = useSlotSize(
      styled?.styleButton,
      'width',
      shape.control[geometry.button].height,
    );

    return (
      <StyledView
        ref={ref}
        styled={{
          style: [defaults.root, { gap: geometry.gap }, styled?.style],
        }}
        {...rest}
      >
        {showRestart ? sideButton('restart', 'Restart', onRestart) : null}
        {showPrevNext ? sideButton('previous', 'Previous', onPrevious) : null}
        {skipButton('skipBack', skipBackSeconds, onSkipBack)}
        <IconButton
          iconName={glyph(playKey).name}
          variant="filled"
          size={size === 'lg' ? 'xl' : 'lg'}
          tone={tone}
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          onPress={onPlayPause}
          styled={{
            style: [
              defaults.play,
              {
                width: geometry.play,
                height: geometry.play,
                borderRadius: playCorner,
              },
              styled?.stylePlay,
            ],
            styleSvg: [
              { width: geometry.playGlyph },
              glyph(playKey).mirrored ? defaults.mirrored : undefined,
            ],
          }}
        />
        {skipButton('skipForward', skipForwardSeconds, onSkipForward)}
        {showPrevNext ? sideButton('next', 'Next', onNext) : null}
        {showRestart ? (
          // Balances the restart button so play/pause stays centred.
          <StyledView
            pointerEvents="none"
            styled={{ style: { width: sideWidth } }}
          />
        ) : null}
      </StyledView>
    );
  },
);
PlaybackControls.displayName = 'PlaybackControls';

export default PlaybackControls;
