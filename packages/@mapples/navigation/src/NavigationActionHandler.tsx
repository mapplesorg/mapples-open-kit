import { useEffect, useLayoutEffect, useRef } from 'react';

import { useActionStore } from '@mapples/action';
import { useDataState } from '@mapples/state';
import { NavigationDocument } from '@mapples/types';

import { toNavigationCommand } from './actionCommands';
import { NavigationActions } from './backend';
import { buildScreenNavigateTarget, entersGuardFromFallback } from './model';
import type {
  NavigationContainerRefWithCurrent,
  ParamListBase,
} from './reactNavigation';

interface NavigationActionHandlerProps {
  navigationRef: NavigationContainerRefWithCurrent<ParamListBase>;
  document: NavigationDocument;
  /** The action creators of the React Navigation behind `navigationRef`. */
  actions: NavigationActions;
}

/**
 * Bridges the `@mapples/action` store to navigation: it subscribes to emitted
 * actions, maps each to a {@link toNavigationCommand} command, and drives the
 * shared navigation container ref. Renders nothing.
 */
const NavigationActionHandler = ({
  navigationRef,
  document,
  actions,
}: NavigationActionHandlerProps) => {
  const actionStore = useActionStore();
  const { getValue } = useDataState();

  // The subscription must outlive state changes. `getValue` changes with
  // every variable write, and re-subscribing on it opened a gap: React runs
  // every effect cleanup of a commit before any effect body, so an action a
  // screen emitted from its own effect in that commit — a guard redirecting
  // because the write just refused it (a sign-out on a guarded screen) — hit
  // the store while nothing was subscribed and was lost. The latest values
  // are read through refs instead, updated before any passive effect runs.
  const latest = useRef({ document, getValue, actions });
  useLayoutEffect(() => {
    latest.current = { document, getValue, actions };
  }, [document, getValue, actions]);

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
      const { document, getValue, actions } = latest.current;
      const { CommonActions, DrawerActions } = actions;
      const command = toNavigationCommand(action, document, {
        // `null`, not `getValue`'s display default: an unresolved param must
        // not reach the screen as the literal string "N/A".
        getStateValue: (path) => getValue({ key: path, active: true }, null),
      });
      if (!command || !navigationRef.isReady()) return;

      switch (command.kind) {
        case 'navigate': {
          // Descend into nested navigators: a flat `navigate(name)` can't reach
          // a screen registered inside a nested navigator.
          const target = buildScreenNavigateTarget(
            document,
            command.routeName,
            command.params,
          );
          if (!target) break;
          const current = navigationRef.getCurrentRoute()?.name;
          const replace =
            command.replace === true ||
            (!!current &&
              entersGuardFromFallback(document, current, command.routeName));
          if (replace) {
            // The target becomes the whole history: a guard redirect leaves
            // no way back into the area it refused, and a sign-in leaves none
            // back to the sign-in screen.
            navigationRef.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: target.name, params: target.params }],
              }),
            );
          } else {
            navigationRef.navigate(target.name, target.params);
          }
          break;
        }
        case 'switchTab': {
          const target = buildScreenNavigateTarget(document, command.routeName);
          if (target) navigationRef.navigate(target.name, target.params);
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
  }, [actionStore, navigationRef]);

  return null;
};

export default NavigationActionHandler;
