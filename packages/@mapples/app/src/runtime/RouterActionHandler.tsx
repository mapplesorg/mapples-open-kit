import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import {
  entersGuardFromFallback,
  resolveRoute,
  routeNameForId,
  toNavigationCommand,
} from '@mapples/navigation';
import { useDataState } from '@mapples/state';
import {
  type UnknownInputParams,
  useNavigationContainerRef,
  useRouter,
} from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';

import type { RouteScreens } from './project';
import { useMapplesRuntime } from './RuntimeContext';

/**
 * The expo-router pathname of a route's screen names: groups stay in it
 * (`['(main)', 'overview']` → `/(main)/overview`), `index` segments drop out
 * (`['index']` → `/`), dynamic segments (`transaction/[id]`) are filled from
 * the params. expo-router 58 reaches a nested screen only by href: a
 * `screen` param is an ordinary param there, so the nested navigator would
 * open on its initial route.
 */
const pathnameFor = (screens: RouteScreens): string =>
  `/${screens
    .flatMap((screen) => screen.split('/'))
    .filter((segment) => segment !== 'index')
    .join('/')}`;

/**
 * The exported app's counterpart of `@mapples/navigation`'s
 * `NavigationActionHandler`: resolves the same `mapples:navigate` /
 * `goBack` / drawer actions with the same `toNavigationCommand`, then drives
 * expo-router's navigation container — by the screen names the CLI laid the
 * route files out under (as an href) instead of the Play runtime's
 * `Navigator:Route` names. A navigate pushes (`router.navigate`); a replace —
 * a guard redirect, a navigate authored with `replace`, or a sign-in entering
 * the area whose guard sent the user away — makes the target the whole
 * history, as Play does and as expo-router's `Stack.Protected` leaves it:
 * the stack is dismissed to its first screen, which the target replaces.
 *
 * Mounted once by `MapplesApp`, inside the action and state providers.
 */
const RouterActionHandler = () => {
  const actionStore = useActionStore();
  const { getValue } = useDataState();
  const { navigation: document, routes, focusedRouteRef } = useMapplesRuntime();
  const navigationRef = useNavigationContainerRef();
  const router = useRouter();

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
          // Route params travel in the URL; expo-router itself warns about a
          // value that cannot be one (an object).
          const href = {
            pathname: pathnameFor(screens),
            params: params as UnknownInputParams | undefined,
          };
          const focused = focusedRouteRef.current
            ? routeNameForId(document, focusedRouteRef.current)
            : null;
          const replace =
            command.kind === 'navigate' &&
            (command.replace === true ||
              (!!focused &&
                entersGuardFromFallback(document, focused, command.routeName)));
          if (replace) {
            if (router.canDismiss()) router.dismissAll();
            router.replace(href);
          } else {
            router.navigate(href);
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
  }, [
    actionStore,
    document,
    focusedRouteRef,
    getValue,
    navigationRef,
    router,
    routes,
  ]);

  return null;
};

export default RouterActionHandler;
