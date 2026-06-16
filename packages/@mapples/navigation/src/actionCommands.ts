import { Action, NavigationDocument } from '@mapples/types';

import { NavigationActionType } from './constants';
import { findRouteNameForPage, resolveScreenName } from './model';
import { NavigationCommand } from './types';

/** Shape of the `payload.data` a `mapples:navigate` action carries. */
interface NavigatePayload {
  routeName?: string;
  pageUuid?: string;
  params?: Record<string, unknown>;
}

/**
 * Translate an emitted {@link Action} into a {@link NavigationCommand}, or
 * `null` if it isn't a navigation action (or can't be resolved). `pageUuid`
 * navigate targets resolve to the first route referencing that page.
 *
 * Pure: no React Navigation involvement, so it can be unit-tested directly.
 */
export const toNavigationCommand = (
  action: Action,
  document: NavigationDocument,
): NavigationCommand | null => {
  switch (action.type) {
    case NavigationActionType.Navigate: {
      const data = (action.payload?.data ?? {}) as NavigatePayload;
      // `findRouteNameForPage` already returns a qualified name; an explicit
      // `routeName` may be qualified (current) or bare (legacy), so both pass
      // through `resolveScreenName`.
      const target =
        data.routeName ??
        (data.pageUuid ? findRouteNameForPage(document, data.pageUuid) : null);
      if (!target) return null;
      const routeName = resolveScreenName(document, target);
      if (!routeName) return null;
      return { kind: 'navigate', routeName, params: data.params };
    }
    case NavigationActionType.GoBack:
      return { kind: 'goBack' };
    case NavigationActionType.OpenDrawer:
      return { kind: 'openDrawer' };
    case NavigationActionType.CloseDrawer:
      return { kind: 'closeDrawer' };
    case NavigationActionType.SwitchTab: {
      const data = (action.payload?.data ?? {}) as NavigatePayload;
      if (!data.routeName) return null;
      const routeName = resolveScreenName(document, data.routeName);
      if (!routeName) return null;
      return { kind: 'switchTab', routeName };
    }
    default:
      return null;
  }
};
