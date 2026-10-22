import { FC, PropsWithChildren, ReactElement, useCallback } from 'react';

import { RouteGuard, RouteScreen } from '@mapples/navigation';
import { VariablesScope } from '@mapples/state';
import { useFocusEffect } from 'expo-router/react-navigation';

import { useMapplesRuntime } from './RuntimeContext';

interface MapplesScreenProps {
  /** The Creator route this expo-router screen renders. */
  routeId: string;
}

/** Records the focused route for the navigation handler. */
const FocusedRoute: FC<{ routeId: string }> = ({ routeId }) => {
  const { focusedRouteRef } = useMapplesRuntime();
  useFocusEffect(
    useCallback(() => {
      focusedRouteRef.current = routeId;
    }, [focusedRouteRef, routeId]),
  );
  return null;
};

/**
 * One expo-router screen with what its Creator route declares — the same
 * wrappers the Play runtime puts around a screen: a page route gets its
 * params (`route.*`), its on-enter action, its guard (redirecting to the
 * fallback, replacing the history) and its page-scoped variables; a route
 * entering a nested navigator gets its guard, which then protects every
 * screen under it.
 */
export const MapplesScreen: FC<PropsWithChildren<MapplesScreenProps>> = ({
  routeId,
  children,
}) => {
  const { navigation: document } = useMapplesRuntime();
  const route = document
    ? Object.values(document.navigators)
        .flatMap((navigator) => navigator.routes)
        .find((candidate) => candidate.id === routeId)
    : undefined;
  if (!document || !route) {
    // The layout naming this route and navigation.ts are written by
    // the same sync; a route one of them lacks is a stale or hand-edited file.
    throw new Error(
      `[@mapples/app] route ${routeId} is not in the synced navigation.ts — run \`mapples sync\``,
    );
  }

  if (route.target.kind === 'navigator') {
    return route.guard ? (
      <RouteGuard route={route} document={document}>
        {children}
      </RouteGuard>
    ) : (
      <>{children}</>
    );
  }

  return (
    <VariablesScope pageUuid={route.target.pageUuid}>
      <FocusedRoute routeId={routeId} />
      <RouteScreen route={route} document={document}>
        {children}
      </RouteScreen>
    </VariablesScope>
  );
};

/**
 * A navigator's `screenLayout` for a CLI-generated `_layout.tsx`: wraps each
 * screen the layout lists (by its expo-router name) in {@link MapplesScreen}.
 * Screens expo-router adds on its own (`_sitemap`, `+not-found`) have no
 * Creator route and render as they are.
 *
 * @example
 * ```tsx
 * const screenLayout = mapplesScreens({ index: '<route id>', profile: '<route id>' });
 * <Tabs screenLayout={screenLayout}>…</Tabs>
 * ```
 */
export const mapplesScreens =
  (routeIds: Record<string, string>) =>
  // A `screenLayout` is called as a function, not rendered as a component.
  // eslint-disable-next-line react/display-name
  ({
    route,
    children,
  }: {
    route: { name: string };
    children: ReactElement;
  }): ReactElement => {
    const routeId = routeIds[route.name];
    if (!routeId) return children;
    return <MapplesScreen routeId={routeId}>{children}</MapplesScreen>;
  };
