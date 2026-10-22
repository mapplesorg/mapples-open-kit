import {
  forwardRef,
  useState,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';

import { StyledView, withAlpha } from '@mapples/style';
import { Tokens, useShape, useTones } from '@mapples/ui';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Line, Polyline, Rect } from 'react-native-svg';

import { defaults, MAP_MARKER_SLOT } from './defaults';
import {
  projectRegion,
  readMapMarkers,
  readMapRegion,
  readMapRoute,
  readRouteProgress,
  splitRoute,
} from './geo';
import MapMarker from './MapMarker';
import {
  MAP_ROUTE_DASH,
  MAP_ROUTE_MUTED,
  MAP_ROUTE_WIDTH,
  MAP_VIEW_HEIGHT,
  MapCoordinate,
  MapViewProps,
} from './types';

/** Avenue positions (share of the box) of the static backdrop. */
const AVENUES_X = [0.18, 0.47, 0.81];
const AVENUES_Y = [0.28, 0.66];

/** Street spacing of the static backdrop, in points. */
const STREET_STEP = 28;

/**
 * A map with Mapples-styled pins — price pins (a pill with `label`, filled
 * with the tone when selected) or round glyph pins — and an optional route
 * whose travelled part (`routeProgress`) is solid and the rest dashed.
 *
 * On iOS and Android it is a real `react-native-maps` map (an optional peer:
 * install `react-native-maps` and rebuild the native app; Android needs a
 * Google Maps API key). On web — this file — `react-native-maps` has no
 * implementation, so it draws a static map: a tinted surface with a street
 * pattern, the route in the tone and the pins projected from their
 * coordinates into the box (Web Mercator, region fitted as a native map
 * fits its initial region). Pins stay pressable; the map does not pan or
 * zoom, so `onRegionChange`, `interactive` and `showsUserLocation` have no
 * effect on web.
 *
 * @example
 * ```tsx
 * <MapView
 *   region={{ latitude: 38.7167, longitude: -9.1395, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
 *   markers={[
 *     { id: 'a', coordinate: { latitude: 38.7139, longitude: -9.1334 }, label: '€650K', selected: true },
 *     { id: 'b', coordinate: { latitude: 38.7223, longitude: -9.1393 }, label: '€480K' },
 *   ]}
 *   onMarkerPress={(id) => select(id)}
 * />
 * ```
 *
 * @public
 */
const MapView: ForwardRefExoticComponent<
  PropsWithChildren<MapViewProps> & RefAttributes<ComponentRef<typeof View>>
> = forwardRef<ComponentRef<typeof View>, PropsWithChildren<MapViewProps>>(
  (
    {
      region: regionProp,
      markers: markersProp,
      route: routeProp,
      routeProgress: routeProgressProp,
      onMarkerPress,
      // Native-only behaviour; the static map ignores them.
      onRegionChange: _onRegionChange,
      interactive: _interactive,
      showsUserLocation: _showsUserLocation,
      height = MAP_VIEW_HEIGHT,
      tone = 'primary',
      accessibilityLabel,
      styled,
      onLayout,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const region = readMapRegion(regionProp);
    const markers = readMapMarkers(markersProp);
    const route = readMapRoute(routeProp);
    const routeProgress = readRouteProgress(routeProgressProp);
    if (!(typeof height === 'number' && height > 0)) {
      throw new Error(`MapView: height (${String(height)}) must be positive`);
    }

    const tones = useTones();
    const shape = useShape();
    const [width, setWidth] = useState(0);

    const handleLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
      onLayout?.(event);
    };

    const palette = tones.tone(tone);
    const surface = tones.resolve(Tokens.color.surface);
    const ground = withAlpha(tones.resolve(Tokens.color.text), 0.06);
    const project = width > 0 ? projectRegion(region, width, height) : null;

    const toPoints = (coordinates: MapCoordinate[]): string =>
      project
        ? coordinates
            .map((coordinate) => {
              const { x, y } = project(coordinate);
              return `${x},${y}`;
            })
            .join(' ')
        : '';

    const parts =
      route && routeProgress !== undefined
        ? splitRoute(route, routeProgress)
        : route
          ? { travelled: route, remaining: [] }
          : null;

    // Selected pins last, so they sit on top.
    const ordered = [
      ...markers.filter((marker) => !marker.selected),
      ...markers.filter((marker) => marker.selected),
    ];

    return (
      <StyledView
        ref={ref}
        accessibilityRole="image"
        accessibilityLabel={
          accessibilityLabel ??
          `Map, ${markers.length} ${markers.length === 1 ? 'place' : 'places'}`
        }
        onLayout={handleLayout}
        styled={{
          style: [
            defaults.root,
            {
              height,
              borderRadius: shape.radius.lg,
              backgroundColor: surface,
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        {project ? (
          <>
            <Svg
              width={width}
              height={height}
              style={defaults.fill}
              pointerEvents="none"
            >
              <Rect x={0} y={0} width={width} height={height} fill={ground} />
              {Array.from(
                { length: Math.ceil(width / STREET_STEP) },
                (_, index) => (
                  <Line
                    key={`v${index}`}
                    x1={(index + 0.5) * STREET_STEP}
                    y1={0}
                    x2={(index + 0.5) * STREET_STEP}
                    y2={height}
                    stroke={tones.divider}
                    strokeWidth={1}
                  />
                ),
              )}
              {Array.from(
                { length: Math.ceil(height / STREET_STEP) },
                (_, index) => (
                  <Line
                    key={`h${index}`}
                    x1={0}
                    y1={(index + 0.5) * STREET_STEP}
                    x2={width}
                    y2={(index + 0.5) * STREET_STEP}
                    stroke={tones.divider}
                    strokeWidth={1}
                  />
                ),
              )}
              {AVENUES_X.map((share) => (
                <Line
                  key={`ax${share}`}
                  x1={share * width}
                  y1={0}
                  x2={share * width + height * 0.12}
                  y2={height}
                  stroke={surface}
                  strokeWidth={6}
                />
              ))}
              {AVENUES_Y.map((share) => (
                <Line
                  key={`ay${share}`}
                  x1={0}
                  y1={share * height}
                  x2={width}
                  y2={share * height - width * 0.05}
                  stroke={surface}
                  strokeWidth={6}
                />
              ))}
              {parts && parts.remaining.length > 1 ? (
                <Polyline
                  points={toPoints(parts.remaining)}
                  fill="none"
                  stroke={withAlpha(palette.main, MAP_ROUTE_MUTED)}
                  strokeWidth={MAP_ROUTE_WIDTH}
                  strokeDasharray={MAP_ROUTE_DASH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {parts && parts.travelled.length > 1 ? (
                <Polyline
                  points={toPoints(parts.travelled)}
                  fill="none"
                  stroke={palette.main}
                  strokeWidth={MAP_ROUTE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>
            {ordered.map((marker) => {
              const { x, y } = project(marker.coordinate);
              const priced = marker.label !== undefined;
              return (
                <StyledView
                  key={marker.id}
                  pointerEvents="box-none"
                  styled={{
                    style: [
                      priced ? defaults.slotBottom : defaults.slotCentre,
                      // A price pin's half-height box ends on the point; a
                      // glyph pin's full box centres on it.
                      {
                        left: x - MAP_MARKER_SLOT / 2,
                        top: y - MAP_MARKER_SLOT / 2,
                      },
                    ],
                  }}
                >
                  <MapMarker
                    label={marker.label}
                    iconName={marker.iconName}
                    selected={marker.selected}
                    tone={marker.tone ?? tone}
                    styled={styled}
                    onPress={
                      onMarkerPress ? () => onMarkerPress(marker.id) : undefined
                    }
                  />
                </StyledView>
              );
            })}
          </>
        ) : null}
      </StyledView>
    );
  },
);
MapView.displayName = 'MapView';

export default MapView;
