import { createContext, FC, PropsWithChildren, useMemo } from 'react';

import { TabScope, TabScopeProvider } from '@mapples/state';

import { NavigatorChromeItem } from './NavigatorChromeContext';

/**
 * The one route a chrome element is repeated for: the per-item scope a
 * container such as `TabTemplate` gives each copy of its template.
 *
 * @interface NavigatorChromeItemScope
 */
export interface NavigatorChromeItemScope {
  /** The route this copy of the template draws. */
  item: NavigatorChromeItem;
  /** Position of the route in the chrome, from 0. */
  index: number;
  /** How many routes the chrome has. */
  count: number;
}

/**
 * Carries the {@link NavigatorChromeItemScope} down to the elements of a
 * repeated template. `undefined` outside one.
 */
const NavigatorChromeItemContext = createContext<
  NavigatorChromeItemScope | undefined
>(undefined);

/**
 * Scopes a copy of a chrome template to one route: the item elements
 * (`TabIcon`, `TabLabel`) read it through `useNavigatorChromeItem`, and any
 * element's bindings read it as `tab.label`, `tab.active` and `tab.index`.
 */
export const NavigatorChromeItemProvider: FC<
  PropsWithChildren<NavigatorChromeItemScope>
> = ({ item, index, count, children }) => {
  const scope = useMemo<NavigatorChromeItemScope>(
    () => ({ item, index, count }),
    [item, index, count],
  );
  const { routeId, label, active } = item;
  const tab = useMemo<TabScope>(
    () => ({ routeId, label, active, index, count }),
    [routeId, label, active, index, count],
  );
  return (
    <NavigatorChromeItemContext.Provider value={scope}>
      <TabScopeProvider value={tab}>{children}</TabScopeProvider>
    </NavigatorChromeItemContext.Provider>
  );
};

export default NavigatorChromeItemContext;
