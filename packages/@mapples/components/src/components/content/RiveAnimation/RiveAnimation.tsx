import {
  createElement,
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
import type {
  Alignment as RiveWebAlignment,
  Fit as RiveWebFit,
  Rive,
  RiveEventPayload,
} from '@rive-app/canvas';
import { Image, LayoutChangeEvent, View } from 'react-native';

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
import { RiveAnimationProps, RiveInputValue, RiveSource } from './types';

/**
 * `@rive-app/canvas` is an **optional peer dependency** of
 * `@mapples/components` (the web half of the "Rive" package), resolved
 * lazily: rendering a RiveAnimation without it throws with the cause.
 */
let RiveWeb: typeof import('@rive-app/canvas') | null = null;
let riveLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  RiveWeb = require('@rive-app/canvas');
} catch (error) {
  riveLoadError = error;
}

const requireRive = (): typeof import('@rive-app/canvas') => {
  if (!RiveWeb) {
    throw new Error(missingRuntimeMessage('@rive-app/canvas', riveLoadError));
  }
  return RiveWeb;
};

const CANVAS_STYLE = { width: '100%', height: '100%', display: 'block' };

const readUrl = (source: RiveSource): string => {
  if (typeof source !== 'number') return source;
  const resolved = Image.resolveAssetSource(source);
  if (!resolved) {
    throw new Error(`RiveAnimation: asset ${source} is not in the bundle`);
  }
  return resolved.uri;
};

/**
 * Sizes the canvas's drawing surface to its layout box. The runtime's own
 * `resizeDrawingSurfaceToCanvas` measures the box on screen, so inside a
 * scaled ancestor (the editor's zoomed frames) it would render at the zoomed
 * size and blur; the layout size does not depend on transforms.
 */
const fitDrawingSurface = (rive: Rive, canvas: HTMLCanvasElement) => {
  canvas.width = Math.round(canvas.clientWidth * window.devicePixelRatio);
  canvas.height = Math.round(canvas.clientHeight * window.devicePixelRatio);
  rive.resizeToCanvas();
};

/** A loaded file and the state machine it runs. */
interface Loaded {
  rive: Rive;
  /** Null when the artboard has no state machine. */
  machine: string | null;
}

/**
 * Plays a Rive (`.riv`) file: an artboard and one of its state machines.
 *
 * The state machine is driven by `inputs` (boolean and number inputs by
 * name — bind an entry to a variable), by the bindable `playing` prop, or by
 * `mapples:animation` actions addressed to the element's `name` (`play`,
 * `pause`, `stop`, `setInput`, `fireTrigger`). Rive events come out through
 * `onEvent`. While the OS "reduce motion" setting is on it does not start on
 * its own.
 *
 * This file is the web player (`@rive-app/canvas`); iOS and Android load
 * `RiveAnimation.native.tsx` (`@rive-app/react-native`). Both are optional
 * peers — the "Rive" package. Only state machines are played: the native
 * runtime has no linear-animation playback.
 *
 * @example
 * ```tsx
 * <RiveAnimation
 *   source="https://example.com/toggle.riv"
 *   name="toggle"
 *   stateMachine="State Machine 1"
 *   inputs={{ isOn: true }}
 *   onEvent={(event) => console.log(event.name)}
 * />
 * ```
 *
 * @public
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
      onLayout,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const { Rive: RiveRuntime, Layout, EventType } = requireRive();
    const fit = readFit(fitProp);
    const alignment = readAlignment(alignmentProp);
    const inputs = readInputs(inputsProp);
    const reduceMotion = useReduceMotion();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [loaded, setLoaded] = useState<Loaded | null>(null);
    // Bumped by `stop`: a reset state machine needs its inputs written again.
    const [resets, setResets] = useState(0);

    const startsOnItsOwn =
      (playing ?? autoPlay) && !(respectReduceMotion && reduceMotion);

    // Callbacks are read through a ref so a new handler does not reload the file.
    const callbacks = useRef({ onEvent, onLoad, onError });
    useLayoutEffect(() => {
      callbacks.current = { onEvent, onLoad, onError };
    });

    const url = source ? readUrl(source) : null;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!url || !canvas) return undefined;

      const rive: Rive = new RiveRuntime({
        src: url,
        canvas,
        artboard,
        autoplay: false,
        onLoad: () => {
          fitDrawingSurface(rive, canvas);
          const machine = stateMachine ?? rive.stateMachineNames[0] ?? null;
          if (machine !== null && !rive.stateMachineNames.includes(machine)) {
            callbacks.current.onError?.(
              `RiveAnimation: state machine "${machine}" is not in the artboard (${rive.stateMachineNames.join(', ')})`,
            );
            return;
          }
          // Instantiates the state machine so its inputs can be read; the
          // playback effect below pauses it again when it must not run.
          if (machine !== null) rive.play(machine);
          setLoaded({ rive, machine });
          callbacks.current.onLoad?.();
        },
        onLoadError: (event) =>
          callbacks.current.onError?.(
            `RiveAnimation: the file could not be loaded (${String(event.data)})`,
          ),
      });
      rive.on(EventType.RiveEvent, (event) => {
        const { name: eventName, properties } = event.data as RiveEventPayload;
        callbacks.current.onEvent?.({
          name: eventName,
          properties: properties as Record<string, string | number | boolean>,
        });
      });

      return () => {
        setLoaded(null);
        rive.cleanup();
      };
      // The runtime exports are module constants.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, artboard, stateMachine]);

    useEffect(() => {
      if (!loaded) return;
      // The web runtime's Fit and Alignment enums carry these same strings.
      loaded.rive.layout = new Layout({
        fit: fit as unknown as RiveWebFit,
        alignment: alignment as unknown as RiveWebAlignment,
      });
      // `Layout` is a module constant.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, fit, alignment]);

    useEffect(() => {
      if (!loaded || loaded.machine === null) return;
      if (startsOnItsOwn) loaded.rive.play(loaded.machine);
      else loaded.rive.pause(loaded.machine);
    }, [loaded, startsOnItsOwn, resets]);

    const findInput = (inputName: string) => {
      if (!loaded || loaded.machine === null) return null;
      const input = loaded.rive
        .stateMachineInputs(loaded.machine)
        ?.find((candidate) => candidate.name === inputName);
      if (!input) {
        callbacks.current.onError?.(
          `RiveAnimation: state machine "${loaded.machine}" has no input "${inputName}"`,
        );
        return null;
      }
      return input;
    };

    const writeInput = (inputName: string, value: RiveInputValue) => {
      const input = findInput(inputName);
      if (input) input.value = value;
    };

    const inputsKey = JSON.stringify(inputs);
    useEffect(() => {
      for (const [inputName, value] of inputs) writeInput(inputName, value);
      // `inputsKey` stands for `inputs`, which is rebuilt each render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded, inputsKey, resets]);

    useAnimationCommands(name, (action) => {
      if (!loaded) return;
      const { rive, machine } = loaded;
      switch (action.command) {
        case 'play':
          if (machine !== null) rive.play(machine);
          return;
        case 'pause':
          if (machine !== null) rive.pause(machine);
          return;
        case 'stop':
          if (machine === null) return;
          rive.reset({ artboard, stateMachines: machine, autoplay: true });
          rive.pause(machine);
          setResets((count) => count + 1);
          return;
        case 'setInput':
          writeInput(readInputName(action.input), readInputValue(action.value));
          return;
        case 'fireTrigger':
          findInput(readInputName(action.input))?.fire();
          return;
        default:
          console.warn(
            `[@mapples/components] RiveAnimation "${name}" has no "${action.command}" command`,
          );
      }
    });

    const handleLayout = (event: LayoutChangeEvent) => {
      if (loaded && canvasRef.current) {
        fitDrawingSurface(loaded.rive, canvasRef.current);
      }
      onLayout?.(event);
    };

    return (
      <StyledView
        ref={ref}
        accessibilityRole="image"
        styled={{ style: [defaults.root, styled?.style] }}
        onLayout={handleLayout}
        {...rest}
      >
        {url
          ? createElement('canvas', { ref: canvasRef, style: CANVAS_STYLE })
          : null}
      </StyledView>
    );
  },
);
RiveAnimation.displayName = 'RiveAnimation';

export default RiveAnimation;
