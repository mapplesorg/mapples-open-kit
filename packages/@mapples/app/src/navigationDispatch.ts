import type { Action } from '@mapples/types';

import { NavigationMap } from './NavigationContext';

/** Minimal structural slice of expo-router's `useRouter()` we depend on. */
export interface RouterLike {
  push: (href: { pathname: string; params?: Record<string, unknown> }) => void;
  canGoBack: () => boolean;
  back: () => void;
}

/** Minimal structural slice of React Navigation's `useNavigation()`. */
export interface NavigationLike {
  dispatch: (action: { type: string }) => void;
}

/**
 * Build the navigation action dispatcher from a resolved route map and the
 * router/navigation objects. Pure (no React, no expo-router) so the per-action
 * behaviour can be unit-tested without a renderer or native modules.
 *
 * Logic is ported verbatim from the CLI's `MapplesActions.ts.tmpl` bridge.
 */
export const createNavigationDispatch =
  (
    routes: NavigationMap['routes'],
    router: RouterLike,
    navigation: NavigationLike,
  ) =>
  (action: Action): void => {
    // Read the action structurally — the action shape is owned by
    // `@mapples/render`/the canvas, not by this package.
    const a = action as unknown as {
      type?: string;
      payload?: {
        data?: { routeName?: string; params?: Record<string, unknown> };
      };
    };
    const data = a.payload?.data ?? {};

    switch (a.type) {
      case 'mapples:navigate':
      case 'mapples:switchTab': {
        const href = data.routeName ? routes[data.routeName] : undefined;
        if (href) {
          router.push({ pathname: href, params: data.params });
        }
        break;
      }
      case 'mapples:goBack':
        if (router.canGoBack()) {
          router.back();
        }
        break;
      case 'mapples:openDrawer':
      case 'mapples:closeDrawer':
        // Dispatch by canonical React Navigation type string, avoiding a hard
        // import of `@react-navigation/drawer` (optional for drawer apps).
        navigation.dispatch({
          type:
            a.type === 'mapples:openDrawer' ? 'OPEN_DRAWER' : 'CLOSE_DRAWER',
        });
        break;
      default:
        break;
    }
  };
