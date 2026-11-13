import { StyledProp } from '@mapples/style';
import { ViewProps, ViewStyle } from 'react-native';

/** Where a Rive file comes from: a URL or a bundled asset (`require('./hero.riv')`). */
export type RiveSource = string | number;

/** How the artboard fits its box. */
export const RIVE_FITS = [
  'contain',
  'cover',
  'fill',
  'fitWidth',
  'fitHeight',
  'none',
  'scaleDown',
  'layout',
] as const;
export type RiveFit = (typeof RIVE_FITS)[number];

/** Where the artboard sits in its box when it does not fill it. */
export const RIVE_ALIGNMENTS = [
  'topLeft',
  'topCenter',
  'topRight',
  'centerLeft',
  'center',
  'centerRight',
  'bottomLeft',
  'bottomCenter',
  'bottomRight',
] as const;
export type RiveAlignment = (typeof RIVE_ALIGNMENTS)[number];

/** Value of a boolean or number state machine input. */
export type RiveInputValue = boolean | number;

/** A Rive event reported by the state machine. */
export interface RiveAnimationEvent {
  /** The event's name as authored in the Rive editor. */
  name: string;
  /** The event's custom properties, when it has any. */
  properties?: Record<string, string | number | boolean>;
}

/** Styled slots of a {@link RiveAnimation}. */
export interface RiveAnimationStyled {
  /** The box the artboard is drawn in. */
  style?: StyledProp<ViewStyle>;
}

/** Props for {@link RiveAnimation}. */
export interface RiveAnimationProps extends Omit<
  ViewProps,
  'children' | 'style'
> {
  /** The `.riv` file to play. Nothing is drawn while it is empty. */
  source?: RiveSource;
  /**
   * The name `mapples:animation` actions address this element by (`play`,
   * `pause`, `stop`, `setInput`, `fireTrigger`). Without it the element takes
   * no actions.
   */
  name?: string;
  /** Artboard to show. Defaults to the file's default artboard. */
  artboard?: string;
  /** State machine to run. Defaults to the artboard's default state machine. */
  stateMachine?: string;
  /**
   * Boolean and number inputs of the state machine, by name:
   * `{ isOn: true, level: 3 }`. Applied on load and whenever a value changes,
   * so binding an entry to a variable drives the state machine from state.
   */
  inputs?: Record<string, RiveInputValue>;
  /** Starts playing once loaded. Defaults to `true`. */
  autoPlay?: boolean;
  /**
   * Controlled playback: `true` plays, `false` pauses, and it wins over
   * `autoPlay`.
   */
  playing?: boolean;
  /** Defaults to `contain`. */
  fit?: RiveFit;
  /** Defaults to `center`. */
  alignment?: RiveAlignment;
  /**
   * While the OS "reduce motion" setting is on, the state machine does not
   * start on its own (`autoPlay`, `playing`). Actions still play it.
   * Defaults to `true`.
   */
  respectReduceMotion?: boolean;
  /** Fires with each Rive event the state machine reports. */
  onEvent?: (event: RiveAnimationEvent) => void;
  /** Fires once the file is loaded and the artboard is drawn. */
  onLoad?: () => void;
  /** Fires with the reason when the file, artboard, state machine or an input is wrong. */
  onError?: (message: string) => void;
  /** Styled slots for every visual part. */
  styled?: RiveAnimationStyled;
}

/** Default box height in points. */
export const RIVE_ANIMATION_HEIGHT = 240;
