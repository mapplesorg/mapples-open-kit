import { useContext } from 'react';

import NavigatorChromeContext, {
  NavigatorChrome,
} from '../context/NavigatorChromeContext';
import NavigatorChromeItemContext, {
  NavigatorChromeItemScope,
} from '../context/NavigatorChromeItemContext';

/**
 * The navigator chrome a host provides, or `undefined` when the component is
 * not mounted as a navigator's chrome. The library's chrome elements use this
 * to tell the designer they are not attached yet instead of failing.
 */
export const useOptionalNavigatorChrome = (): NavigatorChrome | undefined =>
  useContext(NavigatorChromeContext);

/**
 * The route a chrome template copy is rendered for, or `undefined` outside a
 * repeating container (`TabTemplate`). Item elements use this to tell the
 * designer where they belong instead of failing.
 */
export const useOptionalNavigatorChromeItem = ():
  | NavigatorChromeItemScope
  | undefined => useContext(NavigatorChromeItemContext);

/**
 * The route a chrome template copy is rendered for.
 *
 * @throws When no `NavigatorChromeItemProvider` is above — the element is not
 * inside a repeating chrome container.
 */
export const useNavigatorChromeItem = (): NavigatorChromeItemScope => {
  const scope = useContext(NavigatorChromeItemContext);
  if (!scope) {
    throw new Error(
      'useNavigatorChromeItem: no chrome item — the element is not inside a tab item template',
    );
  }
  return scope;
};

/**
 * The navigator chrome a host provides.
 *
 * @throws When no `NavigatorChromeProvider` is above — the component is not
 * mounted as a navigator's tab bar or drawer content.
 */
const useNavigatorChrome = (): NavigatorChrome => {
  const chrome = useContext(NavigatorChromeContext);
  if (!chrome) {
    throw new Error(
      'useNavigatorChrome: no navigator chrome — the component is not mounted as a tab bar or drawer content',
    );
  }
  return chrome;
};

export default useNavigatorChrome;
