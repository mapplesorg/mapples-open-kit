import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';

import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { StyledView } from '@mapples/style';
import { Image, View } from 'react-native';

import { useAnimationCommands } from '../../../animationControl';
import { useReduceMotion } from '../../../internal';

import {
  defaults,
  missingRuntimeMessage,
  readProgress,
  readSegment,
  readSpeed,
} from './shared';
import { LottieAnimationProps, LottieResizeMode, LottieSource } from './types';

/**
 * `@lottiefiles/dotlottie-react` is an **optional peer dependency** of
 * `@mapples/components` (the web half of the "Lottie" package), resolved
 * lazily: rendering a LottieAnimation without it throws with the cause.
 */
let DotLottiePlayer: typeof import('@lottiefiles/dotlottie-react') | null =
  null;
let playerLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DotLottiePlayer = require('@lottiefiles/dotlottie-react');
} catch (error) {
  playerLoadError = error;
}

const requirePlayer = (): typeof import('@lottiefiles/dotlottie-react') => {
  if (!DotLottiePlayer) {
    throw new Error(
      missingRuntimeMessage('@lottiefiles/dotlottie-react', playerLoadError),
    );
  }
  return DotLottiePlayer;
};

const FIT: Record<LottieResizeMode, 'contain' | 'cover' | 'none'> = {
  contain: 'contain',
  cover: 'cover',
  center: 'none',
};

const CANVAS_STYLE = { width: '100%', height: '100%' } as const;

/** What the player loads: a URL, or the animation JSON itself. */
const readSource = (
  source: LottieSource,
): { src: string } | { data: Record<string, unknown> } => {
  if (typeof source === 'string') return { src: source };
  if (typeof source === 'number') {
    const resolved = Image.resolveAssetSource(source);
    if (!resolved) {
      throw new Error(`LottieAnimation: asset ${source} is not in the bundle`);
    }
    return { src: resolved.uri };
  }
  return { data: source };
};

/**
 * Plays a Lottie animation — a `.json` export or a `.lottie` (dotLottie)
 * file — from a project asset, a URL or bundled JSON.
 *
 * Playback is set by props (`autoPlay`, `loop`, `speed`, `direction`, a
 * `startFrame`–`endFrame` range), by the bindable `playing` prop, or by
 * `mapples:animation` actions addressed to the element's `name` (`play`,
 * `pause`, `stop`, `seek`). It reports `onLoad`, `onComplete`, `onLoop` and
 * `onError`. While the OS "reduce motion" setting is on it does not start on
 * its own.
 *
 * This file is the web player (`@lottiefiles/dotlottie-react`); iOS and
 * Android load `LottieAnimation.native.tsx` (`lottie-react-native`). Both
 * are optional peers — the "Lottie" package. `colorOverrides` applies on
 * native only; `onLoop` fires on web only.
 *
 * @example
 * ```tsx
 * <LottieAnimation
 *   source="https://example.com/confetti.lottie"
 *   name="confetti"
 *   autoPlay={false}
 *   loop={false}
 *   onComplete={() => close()}
 * />
 * ```
 *
 * @public
 */
const LottieAnimation: ForwardRefExoticComponent<
  PropsWithChildren<LottieAnimationProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<LottieAnimationProps>
>(
  (
    {
      source,
      name,
      autoPlay = true,
      playing,
      loop = true,
      speed: speedProp = 1,
      direction = 'forward',
      startFrame,
      endFrame,
      resizeMode = 'contain',
      // Keypath recolouring is a native-player feature.
      colorOverrides: _colorOverrides,
      respectReduceMotion = true,
      onComplete,
      onLoop,
      onLoad,
      onError,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const { DotLottieReact } = requirePlayer();
    const speed = readSpeed(speedProp);
    const segment = readSegment({ startFrame, endFrame });
    const reduceMotion = useReduceMotion();
    const [player, setPlayer] = useState<DotLottie | null>(null);
    const [loaded, setLoaded] = useState(false);

    const startsOnItsOwn =
      (playing ?? autoPlay) && !(respectReduceMotion && reduceMotion);

    const handlePlayer = useCallback((next: DotLottie | null) => {
      setPlayer(next);
      setLoaded(false);
    }, []);

    useEffect(() => {
      if (!player) return undefined;
      const handleLoad = () => {
        setLoaded(true);
        onLoad?.();
      };
      const handleError = (event: { error: Error }) =>
        onError?.(event.error.message);
      const handleComplete = () => onComplete?.();
      const handleLoop = () => onLoop?.();
      player.addEventListener('load', handleLoad);
      player.addEventListener('loadError', handleError);
      player.addEventListener('complete', handleComplete);
      player.addEventListener('loop', handleLoop);
      return () => {
        player.removeEventListener('load', handleLoad);
        player.removeEventListener('loadError', handleError);
        player.removeEventListener('complete', handleComplete);
        player.removeEventListener('loop', handleLoop);
      };
    }, [player, onLoad, onError, onComplete, onLoop]);

    // `autoplay` only applies at load; later changes of `playing`, `autoPlay`
    // or the reduce-motion setting are applied here.
    useEffect(() => {
      if (!player || !loaded) return;
      if (startsOnItsOwn) player.play();
      else player.pause();
    }, [player, loaded, startsOnItsOwn]);

    useAnimationCommands(name, (action) => {
      if (!player) return;
      switch (action.command) {
        case 'play':
          player.play();
          return;
        case 'pause':
          player.pause();
          return;
        case 'stop':
          player.stop();
          return;
        case 'seek': {
          const progress = readProgress(action.progress);
          const [first, last] = segment ?? [0, player.totalFrames - 1];
          player.pause();
          player.setFrame(first + (last - first) * progress);
          return;
        }
        default:
          console.warn(
            `[@mapples/components] LottieAnimation "${name}" has no "${action.command}" command`,
          );
      }
    });

    const layout = useMemo(() => ({ fit: FIT[resizeMode] }), [resizeMode]);
    const loadable = useMemo(
      () => (source ? readSource(source) : null),
      [source],
    );

    return (
      <StyledView
        ref={ref}
        accessibilityRole="image"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {loadable ? (
          <DotLottieReact
            {...loadable}
            dotLottieRefCallback={handlePlayer}
            autoplay={startsOnItsOwn}
            loop={loop}
            speed={speed}
            mode={direction}
            segment={segment ?? undefined}
            layout={layout}
            style={CANVAS_STYLE}
          />
        ) : null}
      </StyledView>
    );
  },
);
LottieAnimation.displayName = 'LottieAnimation';

export default LottieAnimation;
