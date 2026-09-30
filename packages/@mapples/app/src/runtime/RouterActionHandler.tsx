import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import {
  entersGuardFromFallback,
  resolveRoute,
  routeNameForId,
  toNavigationCommand,
} from '@mapples/navigation';
import { useDataState } from '@mapples/state';
import { useNavigationContainerRef } from 'expo-router';
import { CommonActions, DrawerActions } from 'expo-router/react-navigation';

import type { RouteScreens } from './project';
import { useMapplesRuntime } from './RuntimeContext';

/** A (possibly nested) React Navigation target: `navigate(name, params)`. */
interface ScreenTarget {
  name: string;
  params?: object;
}

/**
 * The nested target for a route's expo-router screen names: React
 * Navigation reaches a screen inside a nested navigator only through its
 * parents, `navigate('(main)', { screen: 'profile', params })`.
 */
const screenTarget = (
  screens: RouteScreens,
  params: object | undefined,
): ScreenTarget => {
  let target: ScreenTarget = { name: screens[screens.length - 1], params };
  for (let i = screens.length - 2; i >= 0; i--) {
    target = {
      name: screens[i],
      params: { screen: target.name, params: target.params },
    };
  }
  return target;
};

/**
 * The exported app's counterpart of `@mapples/navigation`'s
 * `NavigationActionHandler`: resolves the same `mapples:navigate` /
 * `goBack` / drawer actions with the same `toNavigationCommand`, then drives
 * expo-router's navigation container — by the screen names the CLI laid the
 * route files out under instead of the Play runtime's `Navigator:Route`
 * names. A navigate pushes (React Navigation `navigate`); a replace — a guard
 * redirect, a navigate authored with `replace`, or a sign-in entering the
 * area whose guard sent the user away — makes the target the whole history,
 * as Play does and as expo-router's `Stack.Protected` leaves it.
 *
 * Mounted once by `MapplesApp`, inside the action and state providers.
 */
const RouterActionHandler = () => {
  const actionStore = useActionStore();
  const { getValue } = useDataState();
  const { navigation: document, routes, focusedRouteRef } = useMapplesRuntime();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    if (!document) return;
    const subscription = actionStore.subscribe((action) => {
      const command = toNavigationCommand(action, document, {
        // `null`, not `getValue`'s display default: an unresolved param must
        // not reach the screen as the literal string "N/A".
        getStateValue: (path) => getValue({ key: path, active: true }, null),
      });
      if (!command) return;
      if (!navigationRef.isReady()) {
        throw new Error(
          `[@mapples/app] ${action.type} before the navigation container is ready`,
        );
      }

      switch (command.kind) {
        case 'navigate':
        case 'switchTab': {
          const route = resolveRoute(document, command.routeName);
          const screens = route ? routes[route.id] : undefined;
          if (!route || !screens) {
            // The route file layout and the navigation document come from
            // the same sync; a route missing from one of them is a defect.
            throw new Error(
              `[@mapples/app] no screen for route "${command.routeName}" — run \`mapples sync\``,
            );
          }
          const params =
            command.kind === 'navigate' ? command.params : undefined;
          const target = screenTarget(screens, params);
          const focused = focusedRouteRef.current
            ? routeNameForId(document, focusedRouteRef.current)
            : null;
          const replace =
            command.kind === 'navigate' &&
            (command.replace === true ||
              (!!focused &&
                entersGuardFromFallback(document, focused, command.routeName)));
          if (replace) {
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: target.name, params: target.params }],
              }),
            );
          } else {
            navigationRef.dispatch(
              CommonActions.navigate({
                name: target.name,
                params: target.params,
              }),
            );
          }
          break;
        }
        case 'goBack':
          if (navigationRef.canGoBack()) navigationRef.goBack();
          break;
        case 'openDrawer':
          navigationRef.dispatch(DrawerActions.openDrawer());
          break;
        case 'closeDrawer':
          navigationRef.dispatch(DrawerActions.closeDrawer());
          break;
      }
    });
    return () => subscription.unsubscribe();
  }, [actionStore, document, focusedRouteRef, getValue, navigationRef, routes]);

  return null;
};

export default RouterActionHandler;
