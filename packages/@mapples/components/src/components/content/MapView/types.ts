import { StyledProp } from '@mapples/style';
import { Tone } from '@mapples/ui';
import { TextStyle, ViewProps, ViewStyle } from 'react-native';

/** A point on the map, in degrees. */
export interface MapCoordinate {
  /** −90 to 90. */
  latitude: number;
  /** −180 to 180. */
  longitude: number;
}

/** The visible area: a centre and its span in degrees. */
export interface MapRegion extends MapCoordinate {
  /** North–south span, above 0 up to 180. */
  latitudeDelta: number;
  /** East–west span, above 0 up to 360. */
  longitudeDelta: number;
}

/** One pin on a {@link MapView}. */
export interface MapViewMarker {
  /** Unique within the map; passed to `onMarkerPress`. */
  id: string;
  /** Where the pin points. */
  coordinate: MapCoordinate;
  /** Draws a price pin (a pill with this text, '€650K'); without it the pin is a round glyph. */
  label?: string;
  /** Glyph of a round pin (no `label`); a dot when unset. */
  iconName?: string;
  /** Colour role of this pin. Defaults to the map's `tone`. */
  tone?: Tone;
  /** Fills the pin with the tone (and adds a pointer under a price pin). */
  selected?: boolean;
}

/** Styled slots of a {@link MapView} and its pins. */
export interface MapViewStyled {
  /** The map box (its corner radius and border clip the map). */
  style?: StyledProp<ViewStyle>;
  /** Every pin's body — the pill of a price pin, the disc of a glyph pin. */
  styleMarker?: StyledProp<ViewStyle>;
  /** The selected pins' body, merged over `styleMarker` (its `backgroundColor` also colours the pointer). */
  styleMarkerSelected?: StyledProp<ViewStyle>;
  /** The price pins' text (`color` applies to selected pins too). */
  styleMarkerLabel?: StyledProp<TextStyle>;
}

/** Props for {@link MapView}. */
export interface MapViewProps extends Omit<ViewProps, 'children' | 'style'> {
  /**
   * The area shown first: `{ latitude, longitude, latitudeDelta, longitudeDelta }`.
   * Required — a missing or out-of-range region throws. Changing it moves the
   * map there.
   */
  region?: MapRegion;
  /** The pins: `[{ id, coordinate, label?, iconName?, tone?, selected? }]`; ids unique. */
  markers?: MapViewMarker[];
  /** A path drawn as a line in the tone: `[{ latitude, longitude }]`, at least 2 points. */
  route?: MapCoordinate[];
  /**
   * Share of `route` already travelled, 0 to 1: that part is drawn solid and
   * the rest dashed and muted. Unset draws the whole route solid.
   */
  routeProgress?: number;
  /** Fires with the pin's `id` when a pin is pressed. */
  onMarkerPress?: (id: string) => void;
  /** Fires with the new region when the user stops moving the map (native only). */
  onRegionChange?: (region: MapRegion) => void;
  /** Lets the user pan, zoom and rotate the map. Defaults to `true`. */
  interactive?: boolean;
  /** Shows the user's position (native only; the app needs location permission). */
  showsUserLocation?: boolean;
  /** Map height in points. Defaults to `240`. */
  height?: number;
  /** Colour role of the pins and the route. Defaults to `primary`. */
  tone?: Tone;
  /** Screen-reader summary. Defaults to "Map, 5 places". */
  accessibilityLabel?: string;
  /** Styled slots for every visual part. */
  styled?: MapViewStyled;
}

/** Default map height in points. */
export const MAP_VIEW_HEIGHT = 240;

/** Height of a price pin's pill in points. */
export const MAP_MARKER_PILL_HEIGHT = 28;

/** Height of the pointer under a selected price pin in points. */
export const MAP_MARKER_POINTER = 6;

/** Diameter of a round glyph pin in points. */
export const MAP_MARKER_DISC = 32;

/** Glyph size inside a round pin. */
export const MAP_MARKER_ICON = 16;

/** Route line width in points. */
export const MAP_ROUTE_WIDTH = 4;

/** Dash and gap of the untravelled part of a route, in points. */
export const MAP_ROUTE_DASH = [8, 6];

/** Opacity of the untravelled part of a route. */
export const MAP_ROUTE_MUTED = 0.45;
