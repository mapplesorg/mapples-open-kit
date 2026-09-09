import { useCallback, useState } from 'react';

import {
  GestureResponderEvent,
  MouseEvent,
  NativeSyntheticEvent,
  TargetedEvent,
} from 'react-native';

/** The author's handlers, as React Native types them (nullable). */
export interface InteractionHandlers {
  onPressIn?: ((event: GestureResponderEvent) => void) | null;
  onPressOut?: ((event: GestureResponderEvent) => void) | null;
  onHoverIn?: ((event: MouseEvent) => void) | null;
  onHoverOut?: ((event: MouseEvent) => void) | null;
  onFocus?: ((event: NativeSyntheticEvent<TargetedEvent>) => void) | null;
  onBlur?: ((event: NativeSyntheticEvent<TargetedEvent>) => void) | null;
}

/** The handlers a control spreads onto its Pressable / input. */
export interface ControlHandlers {
  onPressIn: (event: GestureResponderEvent) => void;
  onPressOut: (event: GestureResponderEvent) => void;
  onHoverIn: (event: MouseEvent) => void;
  onHoverOut: (event: MouseEvent) => void;
  onFocus: (event: NativeSyntheticEvent<TargetedEvent>) => void;
  onBlur: (event: NativeSyntheticEvent<TargetedEvent>) => void;
}

export interface InteractionState {
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
  /** Spread onto the Pressable / input; wraps the author's own handlers. */
  handlers: ControlHandlers;
}

/**
 * Tracks pressed / hovered (web) / focused state for a control and returns
 * handlers that also call the author's handlers. Style functions cannot pass
 * through `styled`, so transient states are expressed as style array entries
 * driven by these flags instead of Pressable's `style={(state) => …}` form.
 */
const useInteractionState = (
  handlers: InteractionHandlers = {},
  disabled = false,
): InteractionState => {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const onPressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!disabled) setPressed(true);
      handlers.onPressIn?.(event);
    },
    [disabled, handlers],
  );
  const onPressOut = useCallback(
    (event: GestureResponderEvent) => {
      setPressed(false);
      handlers.onPressOut?.(event);
    },
    [handlers],
  );
  const onHoverIn = useCallback(
    (event: MouseEvent) => {
      if (!disabled) setHovered(true);
      handlers.onHoverIn?.(event);
    },
    [disabled, handlers],
  );
  const onHoverOut = useCallback(
    (event: MouseEvent) => {
      setHovered(false);
      handlers.onHoverOut?.(event);
    },
    [handlers],
  );
  const onFocus = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      if (!disabled) setFocused(true);
      handlers.onFocus?.(event);
    },
    [disabled, handlers],
  );
  const onBlur = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setFocused(false);
      handlers.onBlur?.(event);
    },
    [handlers],
  );

  return {
    pressed: pressed && !disabled,
    hovered: hovered && !disabled,
    focused: focused && !disabled,
    handlers: { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur },
  };
};

export default useInteractionState;
