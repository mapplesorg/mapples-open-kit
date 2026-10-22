import type {
  ApiDocument,
  NavigationDocument,
  VariablesDocument,
} from '@mapples/types';
// The documents `mapples sync` writes next to theme.ts — resolved by
// `mapplesResolver` (`@mapples/app/expo`) to navigation.ts, api.ts and
// variables.ts in the app's mapplesDir, or to an empty module before the
// first sync (the runtime is then inert: no routes, requests or variables).
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as apiModule from 'mapples::api';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as navigationModule from 'mapples::navigation';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as variablesModule from 'mapples::variables';

/**
 * Where a route lives in the exported app: the expo-router screen names from
 * the root navigator down to it — `['(main)', 'profile']` — as the CLI laid
 * the files out. A route entering a nested navigator ends at that
 * navigator's directory (`['(main)']`).
 */
export type RouteScreens = string[];

/** The module `mapples sync` writes as `<mapplesDir>/navigation.ts`. */
export interface CliNavigationModule {
  /** The Creator navigation document. */
  navigation?: NavigationDocument;
  /** Route id → its expo-router screen names. */
  routes?: Record<string, RouteScreens>;
}

/** The module `mapples sync` writes as `<mapplesDir>/api.ts`. */
export interface CliApiModule {
  /** The Creator API document (response samples stripped — design-time data). */
  api?: ApiDocument;
  /**
   * Secret values by the name a request's `auth.secretRef` gives, read from
   * `EXPO_PUBLIC_MAPPLES_SECRET_<NAME>` build-time environment variables.
   * Unset ones are `undefined`: a request that needs one fails as
   * "Secret … is not configured".
   */
  secrets?: Record<string, string | undefined>;
  /**
   * The environment requests run against (id or name), from
   * `EXPO_PUBLIC_MAPPLES_API_ENVIRONMENT`; unset → the document's active one.
   */
  environment?: string;
}

/** The module `mapples sync` writes as `<mapplesDir>/variables.ts`. */
export interface CliVariablesModule {
  /** The Creator variables document. */
  variables?: VariablesDocument;
}

/** Everything the app runtime executes, as `mapples sync` generated it. */
export interface MapplesProject
  extends CliNavigationModule, CliApiModule, CliVariablesModule {}

/** The synced project documents, from the files the CLI wrote. */
export const syncedProject = (): MapplesProject => ({
  ...(navigationModule as CliNavigationModule),
  ...(apiModule as CliApiModule),
  ...(variablesModule as CliVariablesModule),
});
