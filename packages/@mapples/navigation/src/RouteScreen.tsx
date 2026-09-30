import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useActionStore } from '@mapples/action';
import {
  RouteParamsProvider,
  useActiveRoute,
  useDataState,
} from '@mapples/state';
import { NavigationDocument, RouteNode } from '@mapples/types';

import { NavigationActionType } from './constants';
import { routeNameForId } from './model';
import { useFocusEffect, useIsFocused, useRoute } from './vendor';

interface RouteScreenProps {
  route: RouteNode;
  document: NavigationDocument;
}

/**
 * A route's access guard: whether it holds, and — while the route is focused
 * and refused, on arrival or when the guard flips (a sign-out on a guarded
 * screen) — the redirect to its fallback. The redirect REPLACES the history
 * (`replace: true`) the way expo-router's `Stack.Protected` drops protected
 * screens: a guarded area the user may not see must not stay reachable
 * through back buttons on the fallback.
 */
const useRouteGuard = (
  route: RouteNode,
  document: NavigationDocument,
): boolean => {
  const actionStore = useActionStore();
  const focused = useIsFocused();
  const { getConditionResult } = useDataState();

  const allowed =
    route.guard === undefined ||
    route.guard === '' ||
    getConditionResult(route.guard);

  const fallback = route.guardFallbackRouteId;
  useEffect(() => {
    if (allowed || !focused) return;
    const target = fallback ? routeNameForId(document, fallback) : null;
    if (!target) {
      // The validator rejects a guard without a fallback; a document that
      // reached the runtime without one is a defect, not a screen to blank.
      throw new Error(
        `Guarded route "${route.name}" has no fallback route to send the user to`,
      );
    }
    actionStore.next({
      time: Date.now(),
      type: NavigationActionType.Navigate,
      payload: { data: { routeName: target, replace: true } },
    });
  }, [actionStore, allowed, document, fallback, focused, route.name]);

  return allowed;
};

/**
 * Wraps the nested navigator a route enters with that route's guard: a
 * refused guard renders nothing of the area and sends the user to the
 * fallback. Params and on-enter stay with the screens inside — a navigator
 * route publishing its (empty) params would overwrite the focused screen's.
 */
export const RouteGuard: FC<PropsWithChildren<RouteScreenProps>> = ({
  route,
  document,
  children,
}) => {
  const allowed = useRouteGuard(route, document);
  return allowed ? <>{children}</> : null;
};

/**
 * Wraps a page screen with what its route declares: the params it was
 * navigated to with (`route.*` bindings, and the focused-screen params the
 * root handlers read), the `onEnter` action emitted on every focus, and the
 * access guard — a screen whose guard fails renders nothing and sends the
 * user to the route's fallback.
 */
const RouteScreen: FC<PropsWithChildren<RouteScreenProps>> = ({
  route,
  document,
  children,
}) => {
  const { params } = useRoute();
  const routeParams = useMemo(
    () => (params ?? {}) as Record<string, unknown>,
    [params],
  );
  const actionStore = useActionStore();
  const activeRoute = useActiveRoute();
  const allowed = useRouteGuard(route, document);

  const { onEnter } = route;
  const setActiveParams = activeRoute?.setParams;
  const releaseActiveParams = activeRoute?.releaseParams;

  // Each focus (and each param change while focused) is one entry. The
  // params are published to the root first; the entry action is emitted only
  // once that publish has committed, or a root-mounted handler resolving
  // `route.id` for the entry's request would still read the previous screen.
  const [entry, setEntry] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setActiveParams?.(routeParams);
      setEntry((count) => count + 1);
      return () => releaseActiveParams?.(routeParams);
    }, [releaseActiveParams, routeParams, setActiveParams]),
  );

  const paramsPublished = !activeRoute || activeRoute.params === routeParams;
  // One emission per entry: a state change while focused (which changes
  // `allowed`) re-runs the effect but finds the entry already handled.
  const emittedEntry = useRef(0);
  useEffect(() => {
    if (entry === 0 || entry === emittedEntry.current || !paramsPublished) {
      return;
    }
    emittedEntry.current = entry;
    if (!allowed || !onEnter) return;
    actionStore.next({
      time: Date.now(),
      type: onEnter.type,
      payload: {
        originalEventData: [routeParams],
        data: { ...routeParams, ...onEnter.staticData },
      },
    });
  }, [actionStore, allowed, entry, onEnter, paramsPublished, routeParams]);

  if (!allowed) return null;

  return (
    <RouteParamsProvider value={routeParams}>{children}</RouteParamsProvider>
  );
};

export default RouteScreen;
