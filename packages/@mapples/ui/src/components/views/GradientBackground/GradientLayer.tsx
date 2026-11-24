import { ComponentType, useMemo, useState } from 'react';

import { StyledProp, useStyled } from '@mapples/style';
import type {
  ConicGradient,
  Gradient,
  RadialGradient as RadialGradientData,
} from '@mapples/types';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { conicWedges, parseStopColor } from './conic';
import { cornerRadii } from './cornerRadii';

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
  gradient?: Gradient;
  /**
   * Corner radius to clip the gradient layer to, matching the host container's
   * `borderRadius`.
   */
  borderRadius?: number;
  /**
   * The host container's own style. Its corner radii (`borderRadius` and each
   * corner's) are given to the layer, less the host's border, so the gradient
   * follows the host's rounded corners without `overflow: 'hidden'` on it.
   */
  hostStyle?: StyledProp<ViewStyle>;
}

interface Box {
  width: number;
  height: number;
}

/**
 * A radial or conic gradient drawn with SVG. Both need the box's size in
 * points (a conic sweep keeps true angles, a radial one stays round), so
 * the layer measures itself and draws once it knows.
 */
const SvgGradientLayer = ({
  gradient,
  style,
}: {
  gradient: RadialGradientData | ConicGradient;
  style: StyleProp<ViewStyle>;
}) => {
  const [box, setBox] = useState<Box>();

  return (
    <View
      pointerEvents="none"
      style={[style, styles.clip]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox({ width, height });
      }}
    >
      {box && box.width > 0 && box.height > 0 ? (
        <Svg width={box.width} height={box.height}>
          {gradient.type === 'radial' ? (
            <>
              <Defs>
                <RadialGradient
                  id="gradient"
                  gradientUnits="userSpaceOnUse"
                  cx={gradient.center.x * box.width}
                  cy={gradient.center.y * box.height}
                  r={gradient.radius * Math.max(box.width, box.height)}
                >
                  {gradient.stops.map((stop, index) => {
                    const [r, g, b, a] = parseStopColor(stop.color);
                    return (
                      <Stop
                        key={index}
                        offset={stop.position}
                        stopColor={`rgb(${r}, ${g}, ${b})`}
                        stopOpacity={a}
                      />
                    );
                  })}
                </RadialGradient>
              </Defs>
              <Rect
                width={box.width}
                height={box.height}
                fill="url(#gradient)"
              />
            </>
          ) : (
            conicWedges(
              gradient.stops,
              box.width,
              box.height,
              gradient.center,
              gradient.angle ?? 0,
              gradient.repeat ?? 1,
            ).map((wedge, index) => (
              <Path
                key={index}
                d={wedge.path}
                fill={wedge.color}
                fillOpacity={wedge.opacity}
              />
            ))
          )}
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});

/**
 * Renders a gradient as an absolutely-positioned fill layer that a
 * container paints behind its children. This is an **internal layer**, not a
 * standalone canvas component — it has no ref and no intrinsic size. Containers
 * (`View`, `GradientBackground`) mount it as their first child.
 *
 * React Native has no native gradient style, so a gradient travels as data on
 * `props.gradient` (see `@mapples/types`' `Gradient`) and is painted here: a
 * linear one by `expo-linear-gradient`, a radial or conic one with
 * `react-native-svg`.
 * The layer is `pointerEvents="none"` so it never intercepts touches.
 *
 * Degrades to `null` (the container keeps its solid `backgroundColor`) when:
 * - no gradient is supplied,
 * - the gradient is linear and `expo-linear-gradient` isn't installed,
 * - the gradient has fewer than two stops (RN requires ≥2 colors).
 *
 * @public
 */
const GradientLayer = ({
  gradient,
  borderRadius,
  hostStyle,
}: GradientLayerProps) => {
  // Tokens and breakpoints resolved, as the host itself resolves them.
  const resolved = useStyled({ host: hostStyle }) as {
    host?: StyleProp<ViewStyle>;
  };
  const hostRadii = useMemo(
    () => cornerRadii(StyleSheet.flatten(resolved.host)),
    [resolved.host],
  );

  if (!gradient || gradient.stops.length < 2) {
    return null;
  }

  const style: StyleProp<ViewStyle> = [
    StyleSheet.absoluteFill,
    hostRadii,
    borderRadius ? { borderRadius } : null,
  ];

  if (gradient.type === 'radial' || gradient.type === 'conic') {
    return <SvgGradientLayer gradient={gradient} style={style} />;
  }

  if (!LinearGradient) {
    return null;
  }

  const colors = gradient.stops.map((stop) => stop.color);
  const locations = gradient.stops.map((stop) => stop.position);

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
