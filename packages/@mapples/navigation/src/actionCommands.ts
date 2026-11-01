import { isValueSource, resolveValueSource } from '@mapples/state';
import { Action, NavigationDocument } from '@mapples/types';

import { NavigationActionType } from './constants';
import { findRouteNameForPage, resolveScreenName } from './model';
import { NavigationCommand } from './types';

/**
 * Shape of the `payload.data` a `mapples:navigate` action carries. A param is
 * a literal, or an authored value source (`{ kind: 'data', path: 'id' }` for
 * the pressed row's id, `{ kind: 'state', dataProp: 'vars.selected' }`)
 * resolved at emit time.
 */
interface NavigatePayload {
  routeName?: string;
  pageUuid?: string;
  params?: Record<string, unknown>;
  /** Reset the history to the target rather than push it (guard redirects). */
  replace?: boolean;
  /** Emitted by a route guard (see `NavigationCommand.guard`). */
  guard?: boolean;
}

/** What resolving a navigate action's params may need. */
export interface NavigationResolutionContext {
  /** Resolves `state`-kind param sources (a `@mapples/state` lookup). */
  getStateValue?: (path: string) => unknown;
}

/**
 * Resolve authored params to the values the screen receives. A param whose
 * source resolves to nothing is dropped: the screen's `route.<name>` binding
 * then reads as unset rather than as the literal "undefined".
 */
const resolveParams = (
  params: Record<string, unknown> | undefined,
  action: Action,
  context: NavigationResolutionContext,
): Record<string, unknown> | undefined => {
  if (!params) return undefined;
  const resolved: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(params)) {
    const param = isValueSource(value)
      ? resolveValueSource(value, action, context.getStateValue)
      : value;
    if (param !== undefined && param !== null) resolved[name] = param;
  }
  return resolved;
};

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
  context: NavigationResolutionContext = {},
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
      return {
        kind: 'navigate',
        routeName,
        params: resolveParams(data.params, action, context),
        replace: data.replace === true ? true : undefined,
        guard: data.guard === true ? true : undefined,
      };
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
