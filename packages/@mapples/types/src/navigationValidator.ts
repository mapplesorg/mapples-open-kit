import {
  isValidRoutePath,
  NavigationDocument,
  NavigatorNode,
} from './navigation';

/**
 * Codes for the invariants enforced by {@link validateNavigationDocument}.
 *
 * - `ROOT_MISSING` — {@link NavigationDocument.rootNavigatorId} has no matching navigator.
 * - `NAVIGATOR_TARGET_MISSING` — a `navigator` route points at an absent navigator.
 * - `NAVIGATOR_CYCLE` — navigator nesting is not a tree (a cycle or shared child exists).
 * - `INITIAL_ROUTE_INVALID` — `initialRouteId` is not one of the navigator's routes.
 * - `DUPLICATE_ROUTE_NAME` — two routes share a name within one navigator.
 * - `PRESENTATION_NOT_STACK` — a `presentation` is set on a non-stack navigator's route.
 * - `ROUTE_PATH_INVALID` — a route `path` has a malformed segment.
 * - `GUARD_FALLBACK_INVALID` — a guarded route names no fallback, itself, an absent route,
 *   or (on a navigator route) a route inside the area it guards.
 */
export type NavigationValidationCode =
  | 'ROOT_MISSING'
  | 'NAVIGATOR_TARGET_MISSING'
  | 'NAVIGATOR_CYCLE'
  | 'INITIAL_ROUTE_INVALID'
  | 'DUPLICATE_ROUTE_NAME'
  | 'PRESENTATION_NOT_STACK'
  | 'ROUTE_PATH_INVALID'
  | 'GUARD_FALLBACK_INVALID';

/**
 * A single validation failure produced by {@link validateNavigationDocument}.
 *
 * @interface NavigationValidationError
 */
export interface NavigationValidationError {
  /** Machine-readable invariant code. */
  code: NavigationValidationCode;
  /** Human-readable explanation of the failure. */
  message: string;
  /** Id of the navigator the error relates to, when applicable. */
  navigatorId?: string;
  /** Id of the route the error relates to, when applicable. */
  routeId?: string;
}

/**
 * The outcome of validating a {@link NavigationDocument}.
 *
 * @interface NavigationValidationResult
 */
export interface NavigationValidationResult {
  /** `true` when {@link errors} is empty. */
  valid: boolean;
  /** Every invariant violation found. */
  errors: NavigationValidationError[];
}

/**
 * Validate the structural invariants of a {@link NavigationDocument}.
 *
 * Enforces:
 * - `rootNavigatorId` resolves to an existing navigator;
 * - every `navigator`-kind route target resolves to an existing navigator;
 * - navigator nesting forms a tree (no cycles; each navigator reached by at
 *   most one parent);
 * - each navigator's `initialRouteId`, when set, names one of its routes;
 * - route names are unique within their parent navigator;
 * - `presentation` is only set on routes whose parent navigator is a `stack`;
 * - a route `path`, when set, is made of literal, `(group)` or `:param` segments;
 * - a guarded route names a fallback route that exists, is not itself and,
 *   for a navigator route, lies outside the navigator it guards.
 *
 * The check is exhaustive: all violations are collected rather than failing on
 * the first.
 *
 * @param doc - The navigation document to validate.
 * @returns A {@link NavigationValidationResult} listing any violations.
 */
export function validateNavigationDocument(
  doc: NavigationDocument,
): NavigationValidationResult {
  const errors: NavigationValidationError[] = [];
  const navigators = doc.navigators ?? {};

  // rootNavigatorId must resolve.
  if (!navigators[doc.rootNavigatorId]) {
    errors.push({
      code: 'ROOT_MISSING',
      message: `rootNavigatorId "${doc.rootNavigatorId}" does not exist in navigators`,
      navigatorId: doc.rootNavigatorId,
    });
  }

  // Count how many routes target each navigator, to detect shared children.
  const parentCount: Record<string, number> = {};

  for (const navigator of Object.values(navigators)) {
    validateNavigator(navigator, navigators, parentCount, errors);
  }

  // Navigator nesting must be a tree: no navigator may have more than one
  // parent, and following nested targets from the root must not revisit a
  // navigator (cycle detection).
  detectSharedChildren(parentCount, errors);
  detectCycles(doc, navigators, errors);

  return { valid: errors.length === 0, errors };
}

/** Validate a single navigator's routes and per-navigator invariants. */
function validateNavigator(
  navigator: NavigatorNode,
  navigators: Record<string, NavigatorNode>,
  parentCount: Record<string, number>,
  errors: NavigationValidationError[],
): void {
  const routes = navigator.routes ?? [];
  const seenNames = new Set<string>();

  for (const route of routes) {
    // Route names unique within the navigator.
    if (seenNames.has(route.name)) {
      errors.push({
        code: 'DUPLICATE_ROUTE_NAME',
        message: `Duplicate route name "${route.name}" in navigator "${navigator.name}"`,
        navigatorId: navigator.id,
        routeId: route.id,
      });
    }
    seenNames.add(route.name);

    // presentation only valid under a stack parent.
    if (route.presentation !== undefined && navigator.type !== 'stack') {
      errors.push({
        code: 'PRESENTATION_NOT_STACK',
        message: `Route "${route.name}" sets presentation but parent navigator "${navigator.name}" is "${navigator.type}", not "stack"`,
        navigatorId: navigator.id,
        routeId: route.id,
      });
    }

    // A path is the exported app's deep link and the source of the params
    // the screen reads: a malformed one would generate a broken route file.
    if (route.path !== undefined && !isValidRoutePath(route.path)) {
      errors.push({
        code: 'ROUTE_PATH_INVALID',
        message: `Route "${route.name}" has an invalid path "${route.path}" — expected segments like "product/:id"`,
        navigatorId: navigator.id,
        routeId: route.id,
      });
    }

    // A guard with nowhere to go, or one that sends the user back to the
    // guarded screen — or into the area a navigator route guards — loops
    // the navigator.
    if (route.guard !== undefined) {
      const fallback = route.guardFallbackRouteId;
      const exists =
        !!fallback &&
        Object.values(navigators).some((candidate) =>
          (candidate.routes ?? []).some((other) => other.id === fallback),
        );
      const inside =
        !!fallback &&
        route.target.kind === 'navigator' &&
        navigatorRouteIds(route.target.navigatorId, navigators).has(fallback);
      if (!fallback || fallback === route.id || !exists || inside) {
        errors.push({
          code: 'GUARD_FALLBACK_INVALID',
          message: inside
            ? `Guarded route "${route.name}" sends the user to a route inside the area it guards`
            : `Guarded route "${route.name}" needs a fallback route other than itself`,
          navigatorId: navigator.id,
          routeId: route.id,
        });
      }
    }

    // navigator targets must resolve, and contribute to the parent count.
    if (route.target.kind === 'navigator') {
      const targetId = route.target.navigatorId;
      if (!navigators[targetId]) {
        errors.push({
          code: 'NAVIGATOR_TARGET_MISSING',
          message: `Route "${route.name}" targets navigator "${targetId}" which does not exist`,
          navigatorId: navigator.id,
          routeId: route.id,
        });
      } else {
        parentCount[targetId] = (parentCount[targetId] ?? 0) + 1;
      }
    }
  }

  // initialRouteId, when set, must name one of the routes.
  if (
    navigator.initialRouteId !== undefined &&
    !routes.some((r) => r.id === navigator.initialRouteId)
  ) {
    errors.push({
      code: 'INITIAL_ROUTE_INVALID',
      message: `initialRouteId "${navigator.initialRouteId}" is not a route of navigator "${navigator.name}"`,
      navigatorId: navigator.id,
    });
  }
}

/**
 * Every route id under a navigator, nested navigators' routes included — the
 * area a guard on the route entering it protects. Cycle-safe (cycles are
 * reported separately).
 */
export function navigatorRouteIds(
  navigatorId: string,
  navigators: Record<string, NavigatorNode>,
): Set<string> {
  const ids = new Set<string>();
  const visit = (id: string, seen: Set<string>): void => {
    const navigator = navigators[id];
    if (!navigator || seen.has(id)) return;
    seen.add(id);
    for (const route of navigator.routes ?? []) {
      ids.add(route.id);
      if (route.target.kind === 'navigator') {
        visit(route.target.navigatorId, seen);
      }
    }
  };
  visit(navigatorId, new Set());
  return ids;
}

/** Flag any navigator targeted by more than one route (not a tree). */
function detectSharedChildren(
  parentCount: Record<string, number>,
  errors: NavigationValidationError[],
): void {
  for (const [navigatorId, count] of Object.entries(parentCount)) {
    if (count > 1) {
      errors.push({
        code: 'NAVIGATOR_CYCLE',
        message: `Navigator "${navigatorId}" is nested under ${count} routes; navigators must form a tree`,
        navigatorId,
      });
    }
  }
}

/**
 * Walk the navigator nesting from the root, flagging any navigator revisited
 * on a single path (a cycle).
 */
function detectCycles(
  doc: NavigationDocument,
  navigators: Record<string, NavigatorNode>,
  errors: NavigationValidationError[],
): void {
  const reported = new Set<string>();

  const walk = (navigatorId: string, path: Set<string>): void => {
    if (path.has(navigatorId)) {
      if (!reported.has(navigatorId)) {
        reported.add(navigatorId);
        errors.push({
          code: 'NAVIGATOR_CYCLE',
          message: `Navigator "${navigatorId}" participates in a nesting cycle`,
          navigatorId,
        });
      }
      return;
    }
    const navigator = navigators[navigatorId];
    if (!navigator) return; // missing targets already reported elsewhere.

    const nextPath = new Set(path).add(navigatorId);
    for (const route of navigator.routes ?? []) {
      if (route.target.kind === 'navigator') {
        walk(route.target.navigatorId, nextPath);
      }
    }
  };

  walk(doc.rootNavigatorId, new Set<string>());
}
