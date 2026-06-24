import { ComponentType } from 'react';

import type { LinearGradient as LinearGradientData } from '@mapples/types';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

/**
 * Minimal prop shape of `expo-linear-gradient`'s `LinearGradient` — the subset
 * we drive. Declared locally so `@mapples/ui` carries **no compile-time import**
 * of `expo-linear-gradient`: it's an optional peer, resolved lazily at runtime.
 */
interface LinearGradientComponentProps {
  colors: readonly string[];
  locations?: readonly number[] | null;
  start?: { x: number; y: number } | null;
  end?: { x: number; y: number } | null;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
  style?: StyleProp<ViewStyle>;
}

/**
 * `expo-linear-gradient` is an **optional peer dependency** of `@mapples/ui`:
 * apps that never render a gradient shouldn't have to install a native module.
 * It's resolved lazily so the package builds and runs without it — when it's
 * absent (or a node carries no gradient) this component renders nothing and the
 * container falls back to its solid `backgroundColor`.
 */
let LinearGradient: ComponentType<LinearGradientComponentProps> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  LinearGradient = null;
}

/**
 * Props for {@link GradientLayer}.
 *
 * @public
 */
export interface GradientLayerProps {
  /** The gradient payload from a node's `props.gradient`. */
  gradient?: LinearGradientData;
  /**
   * Corner radius to clip the gradient layer to, matching the host container's
   * `borderRadius`. Optional — when omitted, the host must set
   * `overflow: 'hidden'` for the gradient to respect rounded corners.
   */
  borderRadius?: number;
}

/**
 * Renders a linear gradient as an absolutely-positioned fill layer that a
 * container paints behind its children. This is an **internal layer**, not a
 * standalone canvas component — it has no ref and no intrinsic size. Containers
 * (`View`, `GradientBackground`) mount it as their first child.
 *
 * React Native has no native gradient style, so a gradient travels as data on
 * `props.gradient` (see `@mapples/types`' `LinearGradient`) and is painted here.
 * The layer is `pointerEvents="none"` so it never intercepts touches.
 *
 * Degrades to `null` (the container keeps its solid `backgroundColor`) when:
 * - no gradient is supplied,
 * - `expo-linear-gradient` isn't installed,
 * - the gradient has fewer than two stops (RN requires ≥2 colors).
 *
 * @public
 */
const GradientLayer = ({ gradient, borderRadius }: GradientLayerProps) => {
  if (!gradient || !LinearGradient || gradient.type !== 'linear') {
    return null;
  }

  const colors = gradient.stops.map((stop) => stop.color);
  if (colors.length < 2) {
    return null;
  }
  const locations = gradient.stops.map((stop) => stop.position);

  const style: StyleProp<ViewStyle> = [
    StyleSheet.absoluteFill,
    borderRadius ? { borderRadius } : null,
  ];

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      start={gradient.start}
      end={gradient.end}
      pointerEvents="none"
      style={style}
    />
  );
};
GradientLayer.displayName = 'GradientLayer';

export default GradientLayer;
