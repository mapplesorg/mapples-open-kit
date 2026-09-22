import { useEffect } from 'react';

import { useActionStore } from '@mapples/action';
import { useDataState } from '@mapples/state';
import { NavigationDocument } from '@mapples/types';

import { toNavigationCommand } from './actionCommands';
import { buildScreenNavigateTarget } from './model';
import { MapplesNavigationRef } from './types';
import { DrawerActions } from './vendor';

interface NavigationActionHandlerProps {
  navigationRef: MapplesNavigationRef;
  document: NavigationDocument;
}

/**
 * Bridges the `@mapples/action` store to navigation: it subscribes to emitted
 * actions, maps each to a {@link toNavigationCommand} command, and drives the
 * shared navigation container ref. Renders nothing.
 */
const NavigationActionHandler = ({
  navigationRef,
  document,
}: NavigationActionHandlerProps) => {
  const actionStore = useActionStore();
  const { getValue } = useDataState();

  useEffect(() => {
    const subscription = actionStore.subscribe((action) => {
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
          if (target) navigationRef.navigate(target.name, target.params);
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
  }, [actionStore, document, getValue, navigationRef]);

  return null;
};

export default NavigationActionHandler;
