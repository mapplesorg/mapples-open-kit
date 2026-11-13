import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';

import { StyledView } from '@mapples/style';
import type NativeLottieView from 'lottie-react-native';
import type { AnimationObject } from 'lottie-react-native';
import { View } from 'react-native';

import { useAnimationCommands } from '../../../animationControl';
import { useReduceMotion } from '../../../internal';

import {
  defaults,
  missingRuntimeMessage,
  readProgress,
  readSegment,
  readSpeed,
} from './shared';
import { LottieAnimationProps, LottieSource } from './types';

/**
 * `lottie-react-native` is an **optional peer dependency** of
 * `@mapples/components` (the native half of the "Lottie" package), resolved
 * lazily: rendering a LottieAnimation without it throws with the cause.
 */
let Lottie: typeof import('lottie-react-native') | null = null;
let lottieLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Lottie = require('lottie-react-native');
} catch (error) {
  lottieLoadError = error;
}

const requireLottie = (): typeof import('lottie-react-native') => {
  if (!Lottie) {
    throw new Error(
      missingRuntimeMessage('lottie-react-native', lottieLoadError),
    );
  }
  return Lottie;
};

/** A URL becomes `{ uri }`; bundled assets and JSON pass through. */
const readSource = (
  source: LottieSource,
): { uri: string } | number | AnimationObject =>
  typeof source === 'string'
    ? { uri: source }
    : typeof source === 'number'
      ? source
      : (source as unknown as AnimationObject);

/**
 * iOS and Android: the native Lottie player from `lottie-react-native`.
 * Web loads `LottieAnimation.tsx` instead; both share the props in
 * `types.ts`. `onLoop` does not fire here (the native player has no loop
 * callback).
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
      colorOverrides,
      respectReduceMotion = true,
      onComplete,
      // The native player reports no loop event.
      onLoop: _onLoop,
      onLoad,
      onError,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const { default: LottieView } = requireLottie();
    const speed = readSpeed(speedProp);
    const segment = readSegment({ startFrame, endFrame });
    const reduceMotion = useReduceMotion();
    const viewRef = useRef<NativeLottieView>(null);
    const [loaded, setLoaded] = useState(false);
    // Set by a `seek` action; cleared when playback resumes.
    const [seekProgress, setSeekProgress] = useState<number | undefined>();

    const startsOnItsOwn =
      (playing ?? autoPlay) && !(respectReduceMotion && reduceMotion);

    const [first, last] = segment ?? [undefined, undefined];
    const play = () => {
      setSeekProgress(undefined);
      viewRef.current?.play(first, last);
    };

    // Playback is driven from here rather than the player's `autoPlay`, so a
    // frame range, `playing` and the reduce-motion setting all apply the same
    // way at load and on change.
    useEffect(() => {
      if (!loaded) return;
      if (startsOnItsOwn) {
        setSeekProgress(undefined);
        viewRef.current?.play(first, last);
      } else {
        viewRef.current?.pause();
      }
    }, [loaded, startsOnItsOwn, first, last]);

    useAnimationCommands(name, (action) => {
      switch (action.command) {
        case 'play':
          play();
          return;
        case 'pause':
          viewRef.current?.pause();
          return;
        case 'stop':
          setSeekProgress(undefined);
          viewRef.current?.reset();
          return;
        case 'seek':
          viewRef.current?.pause();
          setSeekProgress(readProgress(action.progress));
          return;
        default:
          console.warn(
            `[@mapples/components] LottieAnimation "${name}" has no "${action.command}" command`,
          );
      }
    });

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
          <LottieView
            ref={viewRef}
            source={loadable}
            style={defaults.fill}
            autoPlay={false}
            loop={loop}
            speed={direction === 'reverse' ? -speed : speed}
            progress={seekProgress}
            resizeMode={resizeMode}
            colorFilters={colorOverrides}
            onAnimationLoaded={() => {
              setLoaded(true);
              onLoad?.();
            }}
            onAnimationFailure={(message) => onError?.(message)}
            onAnimationFinish={(isCancelled) => {
              if (!isCancelled) onComplete?.();
            }}
          />
        ) : null}
      </StyledView>
    );
  },
);
LottieAnimation.displayName = 'LottieAnimation';

export default LottieAnimation;
