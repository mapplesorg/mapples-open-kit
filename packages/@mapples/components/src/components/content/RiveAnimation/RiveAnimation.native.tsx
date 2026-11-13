import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';

import { StyledView } from '@mapples/style';
import type { RiveFile } from '@rive-app/react-native';
import { View } from 'react-native';

import { useAnimationCommands } from '../../../animationControl';
import { useReduceMotion } from '../../../internal';

import {
  defaults,
  missingRuntimeMessage,
  readAlignment,
  readFit,
  readInputName,
  readInputs,
  readInputValue,
} from './shared';
import {
  RiveAnimationProps,
  RiveFit,
  RiveInputValue,
  RiveSource,
} from './types';

/**
 * `@rive-app/react-native` (with `react-native-nitro-modules`) is an
 * **optional peer dependency** of `@mapples/components` (the native half of
 * the "Rive" package), resolved lazily: rendering a RiveAnimation without it
 * throws with the cause.
 */
let RiveNative: typeof import('@rive-app/react-native') | null = null;
let riveLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  RiveNative = require('@rive-app/react-native');
} catch (error) {
  riveLoadError = error;
}

const requireRive = (): typeof import('@rive-app/react-native') => {
  if (!RiveNative) {
    throw new Error(
      missingRuntimeMessage('@rive-app/react-native', riveLoadError),
    );
  }
  return RiveNative;
};

/** The native `Fit` enum member each fit name maps to. */
const FIT_KEYS = {
  contain: 'Contain',
  cover: 'Cover',
  fill: 'Fill',
  fitWidth: 'FitWidth',
  fitHeight: 'FitHeight',
  none: 'None',
  scaleDown: 'ScaleDown',
  layout: 'Layout',
} as const satisfies Record<RiveFit, string>;

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * iOS and Android: the native Rive runtime from `@rive-app/react-native`.
 * Web loads `RiveAnimation.tsx` instead; both share the props in `types.ts`.
 */
const RiveAnimation: ForwardRefExoticComponent<
  PropsWithChildren<RiveAnimationProps> &
    RefAttributes<ComponentRef<typeof View>>
> = forwardRef<
  ComponentRef<typeof View>,
  PropsWithChildren<RiveAnimationProps>
>(
  (
    {
      source,
      name,
      artboard,
      stateMachine,
      inputs: inputsProp,
      autoPlay = true,
      playing,
      fit: fitProp = 'contain',
      alignment: alignmentProp = 'center',
      respectReduceMotion = true,
      onEvent,
      onLoad,
      onError,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const { RiveView, RiveFileFactory, Fit, useRive } = requireRive();
    const fit = readFit(fitProp);
    const alignment = readAlignment(alignmentProp);
    const inputs = readInputs(inputsProp);
    const reduceMotion = useReduceMotion();
    const { riveViewRef, setHybridRef } = useRive();
    const [file, setFile] = useState<RiveFile | null>(null);
    // Bumped by `stop`: a reset state machine needs its inputs written again.
    const [resets, setResets] = useState(0);

    const startsOnItsOwn =
      (playing ?? autoPlay) && !(respectReduceMotion && reduceMotion);

    // Callbacks are read through a ref so a new handler does not reload the file.
    const callbacks = useRef({ onEvent, onLoad, onError });
    useLayoutEffect(() => {
      callbacks.current = { onEvent, onLoad, onError };
    });

    useEffect(() => {
      if (!source) return undefined;
      let cancelled = false;
      let opened: RiveFile | null = null;
      const open = (input: RiveSource): Promise<RiveFile> =>
        typeof input === 'number'
          ? RiveFileFactory.fromSource(input, undefined)
          : RiveFileFactory.fromURL(input, undefined);
      open(source).then(
        (next) => {
          if (cancelled) {
            next.dispose();
            return;
          }
          opened = next;
          setFile(next);
        },
        (error: unknown) => {
          if (cancelled) return;
          callbacks.current.onError?.(
            `RiveAnimation: the file could not be loaded (${describe(error)})`,
          );
        },
      );
      return () => {
        cancelled = true;
        setFile(null);
        opened?.dispose();
      };
      // `RiveFileFactory` is a module constant.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source]);

    const view = file ? riveViewRef : null;

    useEffect(() => {
      if (!view) return undefined;
      callbacks.current.onLoad?.();
      view.onEventListener((event) =>
        callbacks.current.onEvent?.({
          name: event.name,
          properties: event.properties,
        }),
      );
      return () => view.removeEventListeners();
    }, [view]);

    const run = (operation: Promise<void>) => {
      operation.catch((error: unknown) =>
        callbacks.current.onError?.(`RiveAnimation: ${describe(error)}`),
      );
    };

    useEffect(() => {
      if (!view) return;
      run(startsOnItsOwn ? view.play() : view.pause());
    }, [view, startsOnItsOwn, resets]);

    // A wrong input name is reported through the view's `onError`.
    const writeInput = (inputName: string, value: RiveInputValue) => {
      if (!view) return;
      if (typeof value === 'boolean') {
        view.setBooleanInputValue(inputName, value);
      } else {
        view.setNumberInputValue(inputName, value);
      }
    };

    const inputsKey = JSON.stringify(inputs);
    useEffect(() => {
      for (const [inputName, value] of inputs) writeInput(inputName, value);
      // `inputsKey` stands for `inputs`, which is rebuilt each render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view, inputsKey, resets]);

    useAnimationCommands(name, (action) => {
      if (!view) return;
      switch (action.command) {
        case 'play':
          run(view.play());
          return;
        case 'pause':
          run(view.pause());
          return;
        case 'stop':
          run(
            view
              .reset()
              .then(() => view.pause())
              .then(() => setResets((count) => count + 1)),
          );
          return;
        case 'setInput':
          writeInput(readInputName(action.input), readInputValue(action.value));
          return;
        case 'fireTrigger':
          view.triggerInput(readInputName(action.input));
          return;
        default:
          console.warn(
            `[@mapples/components] RiveAnimation "${name}" has no "${action.command}" command`,
          );
      }
    });

    return (
      <StyledView
        ref={ref}
        accessibilityRole="image"
        styled={{ style: [defaults.root, styled?.style] }}
        {...rest}
      >
        {file ? (
          <RiveView
            hybridRef={setHybridRef}
            file={file}
            artboardName={artboard}
            stateMachineName={stateMachine}
            autoPlay={false}
            fit={Fit[FIT_KEYS[fit]]}
            // The native Alignment enum carries these same strings.
            alignment={
              alignment as unknown as import('@rive-app/react-native').Alignment
            }
            style={defaults.fill}
            onError={(error) => callbacks.current.onError?.(error.message)}
          />
        ) : null}
      </StyledView>
    );
  },
);
RiveAnimation.displayName = 'RiveAnimation';

export default RiveAnimation;
