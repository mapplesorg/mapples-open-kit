import { Styler } from '@mapples/style';

import {
  RIVE_ALIGNMENTS,
  RIVE_ANIMATION_HEIGHT,
  RIVE_FITS,
  RiveAlignment,
  RiveFit,
  RiveInputValue,
} from './types';

/** Runtime defaults — author slots merge over these. */
export const defaults = Styler.create({
  root: {
    alignSelf: 'stretch',
    height: RIVE_ANIMATION_HEIGHT,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
});

export const readFit = (fit: unknown): RiveFit => {
  if (!(RIVE_FITS as readonly unknown[]).includes(fit)) {
    throw new Error(
      `RiveAnimation: fit (${String(fit)}) must be one of ${RIVE_FITS.join(', ')}`,
    );
  }
  return fit as RiveFit;
};

export const readAlignment = (alignment: unknown): RiveAlignment => {
  if (!(RIVE_ALIGNMENTS as readonly unknown[]).includes(alignment)) {
    throw new Error(
      `RiveAnimation: alignment (${String(alignment)}) must be one of ${RIVE_ALIGNMENTS.join(', ')}`,
    );
  }
  return alignment as RiveAlignment;
};

/** The `inputs` prop as name/value pairs; a non-boolean, non-number value throws. */
export const readInputs = (inputs: unknown): [string, RiveInputValue][] => {
  if (inputs === undefined || inputs === null) return [];
  if (typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new Error(
      'RiveAnimation: inputs must be an object of input name → boolean or number',
    );
  }
  return Object.entries(inputs).map(([name, value]) => {
    if (typeof value !== 'boolean' && typeof value !== 'number') {
      throw new Error(
        `RiveAnimation: input "${name}" (${String(value)}) must be a boolean or a number`,
      );
    }
    return [name, value];
  });
};

/** A `setInput` / `fireTrigger` action's input name. */
export const readInputName = (input: unknown): string => {
  if (typeof input !== 'string' || input === '') {
    throw new Error('RiveAnimation: the action needs an input name');
  }
  return input;
};

/** A `setInput` action's value. */
export const readInputValue = (value: unknown): RiveInputValue => {
  if (typeof value !== 'boolean' && typeof value !== 'number') {
    throw new Error(
      `RiveAnimation: setInput value (${String(value)}) must be a boolean or a number`,
    );
  }
  return value;
};

/** The message both platforms throw when the Rive runtime is not installed. */
export const missingRuntimeMessage = (dependency: string, cause: unknown) =>
  `RiveAnimation: ${dependency} could not be loaded (the "Rive" package). ` +
  'Creator-first app: enable it in Project settings → Packages. ' +
  'Code-first app: run `mapples sync` (it adds the package to package.json), ' +
  'then the install command the sync names; rebuild the native app afterwards. ' +
  `Cause: ${String(cause)}`;
