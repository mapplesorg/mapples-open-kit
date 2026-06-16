import {
  NavigationDocument,
  NavigatorNode,
  NavigatorType,
  RouteNode,
} from '@mapples/types';

/**
 * Build the navigator-qualified screen name for a route.
 *
 * Route names are unique only *within* a navigator (the validator allows two
 * stacks to each own an `index` route), so a bare name like `index` is
 * ambiguous as a `navigate` target. Navigator names are unique per document, so
 * `<navigatorName>:<routeName>` is a stable, unambiguous screen name. This is
 * the name registered with React Navigation and stored as the action target.
 */
export const qualifyRouteName = (
  navigatorName: string,
  routeName: string,
): string => `${navigatorName}:${routeName}`;

/** A screen within a {@link NavigatorModel}. */
export interface ScreenModel {
  /** Navigator-qualified screen name (`<navigatorName>:<routeName>`). */
  routeName: string;
  routeId: string;
  route: RouteNode;
  /** Page leaf, or a nested navigator already expanded into a child model. */
  target:
    | { kind: 'page'; pageUuid: string }
    | { kind: 'navigator'; child: NavigatorModel };
}

/** A fully-expanded navigator ready to be rendered. */
export interface NavigatorModel {
  id: string;
  type: NavigatorType;
  name: string;
  node: NavigatorNode;
  /** Resolved initial route name (defaults to the first screen). */
  initialRouteName?: string;
  screens: ScreenModel[];
}

/**
 * Expand a {@link NavigationDocument} into a navigator tree by following
 * `navigator` route targets from the root. Pure and side-effect free — it does
 * not touch React Navigation, so it can be asserted on directly in tests.
 *
 * Assumes a validated document (see `validateNavigationDocument`); a missing or
 * cyclic navigator reference simply stops that branch rather than throwing.
 */
export const buildNavigationModel = (
  document: NavigationDocument,
): NavigatorModel | null => {
  const build = (
    navigatorId: string,
    seen: Set<string>,
  ): NavigatorModel | null => {
    const node = document.navigators[navigatorId];
    if (!node || seen.has(navigatorId)) return null;

    const nextSeen = new Set(seen).add(navigatorId);
    const screens: ScreenModel[] = [];

    for (const route of node.routes) {
      const routeName = qualifyRouteName(node.name, route.name);
      if (route.target.kind === 'page') {
        screens.push({
          routeName,
          routeId: route.id,
          route,
          target: { kind: 'page', pageUuid: route.target.pageUuid },
        });
      } else {
        const child = build(route.target.navigatorId, nextSeen);
        if (!child) continue;
        screens.push({
          routeName,
          routeId: route.id,
          route,
          target: { kind: 'navigator', child },
        });
      }
    }

    const initialRouteName =
      screens.find((screen) => screen.routeId === node.initialRouteId)
        ?.routeName ?? screens[0]?.routeName;

    return {
      id: node.id,
      type: node.type,
      name: node.name,
      node,
      screens,
      initialRouteName,
    };
  };

  return build(document.rootNavigatorId, new Set());
};

/**
 * The navigator-qualified screen name of the first route (anywhere in the
 * document) that targets a given page. Used to resolve `pageUuid` navigation
 * targets to a screen name.
 */
export const findRouteNameForPage = (
  document: NavigationDocument,
  pageUuid: string,
): string | null => {
  for (const navigator of Object.values(document.navigators)) {
    for (const route of navigator.routes) {
      if (route.target.kind === 'page' && route.target.pageUuid === pageUuid) {
        return qualifyRouteName(navigator.name, route.name);
      }
    }
  }
  return null;
};

/**
 * Resolve a navigation target to the qualified screen name the runtime
 * navigates to.
 *
 * - An exact `<navigator>:<route>` match is returned as-is.
 * - A bare legacy route name (no navigator prefix) resolves to the first route
 *   with that name, qualified, with a one-time warning — backward compatibility
 *   for documents authored before targets were qualified.
 *
 * Returns `null` when nothing matches.
 */
export const resolveScreenName = (
  document: NavigationDocument,
  target: string,
): string | null => {
  let firstBareMatch: string | null = null;

  for (const navigator of Object.values(document.navigators)) {
    for (const route of navigator.routes) {
      const qualified = qualifyRouteName(navigator.name, route.name);
      if (qualified === target) return qualified;
      if (route.name === target && firstBareMatch === null) {
        firstBareMatch = qualified;
      }
    }
  }

  if (firstBareMatch) {
    console.warn(
      `[mapples-navigation] navigation target "${target}" is a bare route name ` +
        `and was resolved to "${firstBareMatch}". Re-save the navigation ` +
        `document to store the qualified "navigator:route" target.`,
    );
    return firstBareMatch;
  }

  return null;
};

/**
 * The set of route ids nested beneath a tree node — every screen reachable
 * under a navigator, or under a route that targets a navigator. The editor uses
 * this to keep a parent node selected while the preview shows one of its
 * descendant screens.
 */
export const collectDescendantRouteIds = (
  document: NavigationDocument,
  nodeId: string,
): Set<string> => {
  const result = new Set<string>();

  const collect = (navigatorId: string, seen: Set<string>): void => {
    const navigator = document.navigators[navigatorId];
    if (!navigator || seen.has(navigatorId)) return;
    const next = new Set(seen).add(navigatorId);
    for (const route of navigator.routes) {
      result.add(route.id);
      if (route.target.kind === 'navigator') {
        collect(route.target.navigatorId, next);
      }
    }
  };

  if (document.navigators[nodeId]) {
    collect(nodeId, new Set());
    return result;
  }

  for (const navigator of Object.values(document.navigators)) {
    const route = navigator.routes.find((r) => r.id === nodeId);
    if (route) {
      if (route.target.kind === 'navigator') {
        collect(route.target.navigatorId, new Set());
      }
      break;
    }
  }
  return result;
};

/** A React Navigation `navigate` call: a screen name plus optional nested params. */
export interface ScreenNavigateTarget {
  name: string;
  params?: object;
}

/** Qualified screen names from the root navigator down to `screenName`. */
const findScreenPath = (
  document: NavigationDocument,
  screenName: string,
): string[] | null => {
  const visit = (navigatorId: string, seen: Set<string>): string[] | null => {
    const navigator = document.navigators[navigatorId];
    if (!navigator || seen.has(navigatorId)) return null;
    const next = new Set(seen).add(navigatorId);
    for (const route of navigator.routes) {
      const qualified = qualifyRouteName(navigator.name, route.name);
      if (qualified === screenName) return [qualified];
      if (route.target.kind === 'navigator') {
        const sub = visit(route.target.navigatorId, next);
        if (sub) return [qualified, ...sub];
      }
    }
    return null;
  };
  return visit(document.rootNavigatorId, new Set());
};

/**
 * Build the (possibly nested) navigate target for a qualified screen name.
 *
 * React Navigation can't reach a screen inside a nested navigator by a flat
 * name — it descends via `navigate(parent, { screen, params })`. We walk the
 * document from the root to the target route and nest the qualified screen
 * names so the action lands in the right navigator. Returns `null` when the
 * name resolves to no route.
 *
 * @example
 * // screen "HomeStack:Feed" nested under the "Root:HomeTab" route →
 * { name: 'Root:HomeTab', params: { screen: 'HomeStack:Feed', params: undefined } }
 */
export const buildScreenNavigateTarget = (
  document: NavigationDocument,
  screenName: string,
  params?: object,
): ScreenNavigateTarget | null => {
  const names = findScreenPath(document, screenName);
  if (!names) return null;

  let target: ScreenNavigateTarget = { name: names[names.length - 1], params };
  for (let i = names.length - 2; i >= 0; i--) {
    target = {
      name: names[i],
      params: { screen: target.name, params: target.params },
    };
  }
  return target;
};
