import { StyledProp } from '@mapples/style';
import { ViewProps, ViewStyle } from 'react-native';

/**
 * Where a Lottie animation comes from: a URL (`.json` or `.lottie`), a
 * bundled asset (`require('./loader.lottie')`) or the animation JSON itself
 * (`require('./loader.json')`).
 */
export type LottieSource = string | number | Record<string, unknown>;

/** Playback direction of a {@link LottieAnimation}. */
export type LottieDirection = 'forward' | 'reverse';

/** How the animation fits its box. */
export type LottieResizeMode = 'contain' | 'cover' | 'center';

/** Recolours the layers matching an After Effects keypath. */
export interface LottieColorOverride {
  /** Layer keypath, e.g. `"Circle.**"`. */
  keypath: string;
  /** Any colour the platform parses, e.g. `"#ff5500"`. */
  color: string;
}

/** Styled slots of a {@link LottieAnimation}. */
export interface LottieAnimationStyled {
  /** The box the animation is drawn in. */
  style?: StyledProp<ViewStyle>;
}

/** Props for {@link LottieAnimation}. */
export interface LottieAnimationProps extends Omit<
  ViewProps,
  'children' | 'style'
> {
  /** The animation to play. Nothing is drawn while it is empty. */
  source?: LottieSource;
  /**
   * The name `mapples:animation` actions address this element by
   * (`play`, `pause`, `stop`, `seek`). Without it the element takes no actions.
   */
  name?: string;
  /** Starts playing once loaded. Defaults to `true`. */
  autoPlay?: boolean;
  /**
   * Controlled playback: `true` plays, `false` pauses, and it wins over
   * `autoPlay`. Bind it to a variable to drive playback from state.
   */
  playing?: boolean;
  /** Restarts when the end is reached. Defaults to `true`. */
  loop?: boolean;
  /** Playback rate, above 0. Defaults to `1`. */
  speed?: number;
  /** Defaults to `forward`. */
  direction?: LottieDirection;
  /** First frame of the played range. Set together with `endFrame`. */
  startFrame?: number;
  /** Last frame of the played range. Set together with `startFrame`. */
  endFrame?: number;
  /** Defaults to `contain`. */
  resizeMode?: LottieResizeMode;
  /** Recolours layers by keypath (iOS and Android; ignored on web). */
  colorOverrides?: LottieColorOverride[];
  /**
   * While the OS "reduce motion" setting is on, the animation does not start
   * on its own (`autoPlay`, `playing`) and rests on its first frame. Actions
   * still play it. Defaults to `true`.
   */
  respectReduceMotion?: boolean;
  /** Fires when a non-looping animation reaches its end. */
  onComplete?: () => void;
  /** Fires each time a looping animation restarts (web only). */
  onLoop?: () => void;
  /** Fires once the animation is loaded and its first frame is drawn. */
  onLoad?: () => void;
  /** Fires with the reason when the animation cannot be loaded. */
  onError?: (message: string) => void;
  /** Styled slots for every visual part. */
  styled?: LottieAnimationStyled;
}

/** Default box height in points. */
export const LOTTIE_ANIMATION_HEIGHT = 200;
