import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from 'react';

import { StyledView, withAlpha } from '@mapples/style';
import { Tokens, useShape, useTones } from '@mapples/ui';
import { Platform, View } from 'react-native';
import type NativeMapView from 'react-native-maps';

import { defaults } from './defaults';
import {
  readMapMarkers,
  readMapRegion,
  readMapRoute,
  readRouteProgress,
  splitRoute,
} from './geo';
import MapMarker from './MapMarker';
import {
  MAP_MARKER_PILL_HEIGHT,
  MAP_MARKER_POINTER,
  MAP_ROUTE_DASH,
  MAP_ROUTE_MUTED,
  MAP_ROUTE_WIDTH,
  MAP_VIEW_HEIGHT,
  MapViewProps,
} from './types';

/**
 * `react-native-maps` is an **optional peer dependency** of
 * `@mapples/components` (the "Maps" package: Project settings → Packages in
 * the Creator, or `mapples sync` in a code-first app): it is a native module,
 * so apps without a map should not have to install it. Resolved lazily; when
 * it cannot be loaded, rendering a MapView throws with the cause — nothing is
 * drawn in its place. The message names both flows, since after a sync the
 * dependency is already in package.json and only the install and the native
 * rebuild are missing.
 */
let Maps: typeof import('react-native-maps') | null = null;
let mapsLoadError: unknown = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Maps = require('react-native-maps');
} catch (error) {
  mapsLoadError = error;
}

const requireMaps = (): typeof import('react-native-maps') => {
  if (!Maps) {
    throw new Error(
      'MapView: react-native-maps could not be loaded (the "Maps" package). ' +
        'Creator-first app: enable it in Project settings → Packages. ' +
        'Code-first app: run `mapples sync` (it adds the package to ' +
        'package.json), then the install command the sync names. Either way ' +
        `rebuild the native app afterwards. Cause: ${String(mapsLoadError)}`,
    );
  }
  return Maps;
};

/**
 * iOS (Apple Maps) ignores `anchor` and centres custom marker views on their
 * coordinate; this lifts a price pin so its bottom (or pointer tip) rests on
 * the point instead.
 */
const priceCenterOffset = (selected: boolean) => ({
  x: 0,
  y: -(MAP_MARKER_PILL_HEIGHT + (selected ? MAP_MARKER_POINTER : 0)) / 2,
});

/**
 * iOS and Android: a real map from `react-native-maps` (Apple Maps on iOS,
 * Google Maps on Android) with Mapples-styled pins as custom marker views
 * and the route as polylines. Web loads the static `MapView.tsx` instead.
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
      onRegionChange,
      interactive = true,
      showsUserLocation = false,
      height = MAP_VIEW_HEIGHT,
      tone = 'primary',
      accessibilityLabel,
      styled,
      // The canvas injects a drop area as children; leaf components ignore them.
      children: _children,
      ...rest
    },
    ref,
  ) => {
    const { default: NativeMap, Marker, Polyline } = requireMaps();
    const region = readMapRegion(regionProp);
    const markers = readMapMarkers(markersProp);
    const route = readMapRoute(routeProp);
    const routeProgress = readRouteProgress(routeProgressProp);
    if (!(typeof height === 'number' && height > 0)) {
      throw new Error(`MapView: height (${String(height)}) must be positive`);
    }

    const tones = useTones();
    const shape = useShape();
    const palette = tones.tone(tone);
    const mapRef = useRef<NativeMapView>(null);

    // `initialRegion` places the map once; a later `region` prop moves it.
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const placed = useRef(false);
    useEffect(() => {
      if (!placed.current) {
        placed.current = true;
        return;
      }
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      });
    }, [latitude, longitude, latitudeDelta, longitudeDelta]);

    const parts =
      route && routeProgress !== undefined
        ? splitRoute(route, routeProgress)
        : route
          ? { travelled: route, remaining: [] }
          : null;

    return (
      <StyledView
        ref={ref}
        accessibilityLabel={
          accessibilityLabel ??
          `Map, ${markers.length} ${markers.length === 1 ? 'place' : 'places'}`
        }
        styled={{
          style: [
            defaults.root,
            {
              height,
              borderRadius: shape.radius.lg,
              backgroundColor: tones.resolve(Tokens.color.surface),
            },
            styled?.style,
          ],
        }}
        {...rest}
      >
        <NativeMap
          ref={mapRef}
          style={defaults.fill}
          initialRegion={region}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          rotateEnabled={interactive}
          pitchEnabled={interactive}
          showsUserLocation={showsUserLocation}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          onRegionChangeComplete={
            onRegionChange ? (next) => onRegionChange(next) : undefined
          }
        >
          {parts && parts.remaining.length > 1 ? (
            <Polyline
              coordinates={parts.remaining}
              strokeColor={withAlpha(palette.main, MAP_ROUTE_MUTED)}
              strokeWidth={MAP_ROUTE_WIDTH}
              lineDashPattern={MAP_ROUTE_DASH}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}
          {parts && parts.travelled.length > 1 ? (
            <Polyline
              coordinates={parts.travelled}
              strokeColor={palette.main}
              strokeWidth={MAP_ROUTE_WIDTH}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}
          {markers.map((marker) => {
            const priced = marker.label !== undefined;
            const selected = !!marker.selected;
            return (
              <Marker
                // Remount when the look changes so the marker snapshot updates.
                key={`${marker.id}:${selected ? 1 : 0}:${marker.label ?? ''}`}
                identifier={marker.id}
                coordinate={marker.coordinate}
                anchor={priced ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
                centerOffset={
                  priced && Platform.OS === 'ios'
                    ? priceCenterOffset(selected)
                    : undefined
                }
                zIndex={selected ? 2 : 1}
                onPress={
                  onMarkerPress ? () => onMarkerPress(marker.id) : undefined
                }
              >
                <MapMarker
                  label={marker.label}
                  iconName={marker.iconName}
                  selected={selected}
                  tone={marker.tone ?? tone}
                  styled={styled}
                />
              </Marker>
            );
          })}
        </NativeMap>
      </StyledView>
    );
  },
);
MapView.displayName = 'MapView';

export default MapView;
