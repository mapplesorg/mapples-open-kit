import { TONES, Tone } from '@mapples/ui';

import { MapCoordinate, MapRegion, MapViewMarker } from './types';

/**
 * @fileoverview Validation and geometry shared by the native map and the
 * static web map. Bad data is reported with a clear error, never repaired.
 */

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** `{ latitude, longitude }` checked for range. */
export const readMapCoordinate = (
  value: unknown,
  where: string,
): MapCoordinate => {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`MapView: ${where} must be { latitude, longitude }`);
  }
  const { latitude, longitude } = value as Record<string, unknown>;
  if (!isFiniteNumber(latitude) || latitude < -90 || latitude > 90) {
    throw new Error(
      `MapView: ${where}.latitude (${String(latitude)}) must be a number from -90 to 90`,
    );
  }
  if (!isFiniteNumber(longitude) || longitude < -180 || longitude > 180) {
    throw new Error(
      `MapView: ${where}.longitude (${String(longitude)}) must be a number from -180 to 180`,
    );
  }
  return { latitude, longitude };
};

/** The required `region`, checked for range. */
export const readMapRegion = (region: unknown): MapRegion => {
  if (region === undefined || region === null) {
    throw new Error(
      'MapView: region is required — { latitude, longitude, latitudeDelta, longitudeDelta }',
    );
  }
  const { latitude, longitude } = readMapCoordinate(region, 'region');
  const { latitudeDelta, longitudeDelta } = region as Record<string, unknown>;
  if (!isFiniteNumber(latitudeDelta) || latitudeDelta <= 0) {
    throw new Error(
      `MapView: region.latitudeDelta (${String(latitudeDelta)}) must be above 0`,
    );
  }
  if (latitudeDelta > 180) {
    throw new Error(
      `MapView: region.latitudeDelta (${latitudeDelta}) must be at most 180`,
    );
  }
  if (!isFiniteNumber(longitudeDelta) || longitudeDelta <= 0) {
    throw new Error(
      `MapView: region.longitudeDelta (${String(longitudeDelta)}) must be above 0`,
    );
  }
  if (longitudeDelta > 360) {
    throw new Error(
      `MapView: region.longitudeDelta (${longitudeDelta}) must be at most 360`,
    );
  }
  return { latitude, longitude, latitudeDelta, longitudeDelta };
};

const isTone = (value: unknown): value is Tone =>
  typeof value === 'string' && (TONES as readonly string[]).includes(value);

/** The pins, checked one by one; no `markers` is an empty map. */
export const readMapMarkers = (markers: unknown): MapViewMarker[] => {
  if (markers === undefined) return [];
  if (!Array.isArray(markers)) {
    throw new Error('MapView: markers must be an array of pins');
  }
  const ids = new Set<string>();
  return markers.map((marker: unknown, index) => {
    const where = `markers[${index}]`;
    if (typeof marker !== 'object' || marker === null) {
      throw new Error(`MapView: ${where} must be { id, coordinate, … }`);
    }
    const { id, coordinate, label, iconName, tone, selected } =
      marker as Record<string, unknown>;
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error(`MapView: ${where}.id must be a non-empty string`);
    }
    if (ids.has(id)) {
      throw new Error(`MapView: ${where}.id ("${id}") is used by another pin`);
    }
    ids.add(id);
    if (label !== undefined && typeof label !== 'string') {
      throw new Error(`MapView: ${where}.label must be a string`);
    }
    if (iconName !== undefined && typeof iconName !== 'string') {
      throw new Error(`MapView: ${where}.iconName must be a string`);
    }
    if (tone !== undefined && !isTone(tone)) {
      throw new Error(
        `MapView: ${where}.tone ("${String(tone)}") must be one of ${TONES.join(', ')}`,
      );
    }
    if (selected !== undefined && typeof selected !== 'boolean') {
      throw new Error(`MapView: ${where}.selected must be a boolean`);
    }
    return {
      id,
      coordinate: readMapCoordinate(coordinate, `${where}.coordinate`),
      label,
      iconName,
      tone,
      selected,
    };
  });
};

/** The optional `route`: at least 2 checked points. */
export const readMapRoute = (route: unknown): MapCoordinate[] | undefined => {
  if (route === undefined) return undefined;
  if (!Array.isArray(route)) {
    throw new Error(
      'MapView: route must be an array of { latitude, longitude }',
    );
  }
  if (route.length < 2) {
    throw new Error(
      `MapView: route needs at least 2 points (got ${route.length})`,
    );
  }
  return route.map((point: unknown, index) =>
    readMapCoordinate(point, `route[${index}]`),
  );
};

/** The optional `routeProgress`, 0 to 1. */
export const readRouteProgress = (progress: unknown): number | undefined => {
  if (progress === undefined) return undefined;
  if (!isFiniteNumber(progress) || progress < 0 || progress > 1) {
    throw new Error(
      `MapView: routeProgress (${String(progress)}) must be a number from 0 to 1`,
    );
  }
  return progress;
};

/** A route cut at a share of its length. */
export interface RouteParts {
  /** From the start to the cut — drawn solid. */
  travelled: MapCoordinate[];
  /** From the cut to the end — drawn dashed and muted. */
  remaining: MapCoordinate[];
}

/**
 * Cuts `route` at `progress` (0–1) of its length. Lengths are measured on a
 * local flat projection (longitude scaled by the cosine of the mean
 * latitude), which is exact enough at city and region scale.
 */
export const splitRoute = (
  route: MapCoordinate[],
  progress: number,
): RouteParts => {
  const meanLatitude =
    route.reduce((sum, point) => sum + point.latitude, 0) / route.length;
  const scale = Math.cos((meanLatitude * Math.PI) / 180);
  const lengths = route.slice(1).map((point, index) => {
    const previous = route[index];
    return Math.hypot(
      (point.longitude - previous.longitude) * scale,
      point.latitude - previous.latitude,
    );
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total === 0 || progress <= 0) {
    return { travelled: [], remaining: route };
  }
  if (progress >= 1) {
    return { travelled: route, remaining: [] };
  }
  let left = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index];
    if (left <= length) {
      const from = route[index];
      const to = route[index + 1];
      const t = length === 0 ? 0 : left / length;
      const cut = {
        latitude: from.latitude + (to.latitude - from.latitude) * t,
        longitude: from.longitude + (to.longitude - from.longitude) * t,
      };
      return {
        travelled: [...route.slice(0, index + 1), cut],
        remaining: [cut, ...route.slice(index + 1)],
      };
    }
    left -= length;
  }
  return { travelled: route, remaining: [] };
};

/** A point inside the map box, in points from its top-left corner. */
export interface MapPoint {
  x: number;
  y: number;
}

/** Web Mercator `y` of a latitude, as a share of the world height. */
const mercatorY = (latitude: number): number => {
  const clamped = Math.max(-85, Math.min(85, latitude));
  const radians = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2)) / (2 * Math.PI);
};

/**
 * Projects coordinates into a `width` × `height` box showing `region` the
 * way a native map shows an initial region: Web Mercator, centred on the
 * region and zoomed so the whole region fits (the longer side gets extra
 * map around it).
 */
export const projectRegion = (
  region: MapRegion,
  width: number,
  height: number,
): ((coordinate: MapCoordinate) => MapPoint) => {
  const spanX = region.longitudeDelta / 360;
  const spanY = Math.abs(
    mercatorY(region.latitude + region.latitudeDelta / 2) -
      mercatorY(region.latitude - region.latitudeDelta / 2),
  );
  const scale = Math.min(width / spanX, spanY > 0 ? height / spanY : Infinity);
  const centreX = region.longitude / 360;
  const centreY = mercatorY(region.latitude);
  return ({ latitude, longitude }) => ({
    x: width / 2 + (longitude / 360 - centreX) * scale,
    y: height / 2 - (mercatorY(latitude) - centreY) * scale,
  });
};
