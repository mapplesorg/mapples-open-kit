/**
 * @fileoverview Cross-cutting style value types shared by the runtime renderer
 * and tooling that emits `RenderDom` (e.g. the Figma connector).
 *
 * These are *data* contracts — plain serializable shapes that travel inside a
 * node's `props`. They intentionally live in `@mapples/types` (which has no
 * React Native runtime dependency) so both the renderer and any producer can
 * depend on the same definition without pulling in `expo-linear-gradient`.
 *
 * @packageDocumentation
 * @public
 */

/**
 * A single stop in a {@link LinearGradient}.
 *
 * @property color - A CSS/RN color string (e.g. `rgba(…)`), already folded with
 *   the paint and per-stop opacity by the producer.
 * @property position - Normalized offset along the gradient axis, `0`–`1`.
 *
 * @public
 */
export interface GradientStop {
  color: string;
  position: number;
}

/**
 * Structured linear-gradient payload carried on `RenderDomNode.props.gradient`.
 *
 * React Native has no native gradient style, so a gradient travels as data and
 * is rendered by the container components in `@mapples/ui` (which wrap
 * `expo-linear-gradient`). `start`/`end` are normalized object-space
 * coordinates (`0`–`1`), matching Figma's `gradientHandlePositions`: `{x:0,y:0}`
 * is the top-left of the node's box, `{x:1,y:1}` the bottom-right.
 *
 * This shape is the **runtime-owned contract**: producers such as the Figma
 * connector emit exactly this. Keep it in sync with
 * `@mapplesorg/figma-connector`'s `LinearGradient` type.
 *
 * @public
 */
export interface LinearGradient {
  type: 'linear';
  stops: GradientStop[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

/**
 * A radial gradient: colours spread from a centre outwards. `center` is in
 * the same normalized object space as a linear gradient's `start` / `end`
 * (`{x: 0.5, y: 0.5}` is the middle of the box); `radius` is a fraction of
 * the box's larger side (`0.5` reaches the edges of a square from its
 * middle).
 *
 * @public
 */
export interface RadialGradient {
  type: 'radial';
  stops: GradientStop[];
  center: { x: number; y: number };
  radius: number;
}

/**
 * An angular (conic) gradient: colours sweep around a centre, clockwise
 * from `angle` (degrees; `0` points up). `repeat` plays the stops that many
 * times around the circle, which is how rays are drawn: two colours with a
 * hard edge between them (the same `position` twice) and `repeat: 12` give
 * twelve rays.
 *
 * @public
 */
export interface ConicGradient {
  type: 'conic';
  stops: GradientStop[];
  center: { x: number; y: number };
  /** Degrees the sweep starts at; `0` points up. Defaults to `0`. */
  angle?: number;
  /** How many times the stops repeat around the circle. Defaults to `1`. */
  repeat?: number;
}

/**
 * Any gradient payload a node may carry: linear (painted by
 * `expo-linear-gradient`), radial or conic (both painted with
 * `react-native-svg`).
 *
 * @public
 */
export type Gradient = LinearGradient | RadialGradient | ConicGradient;
