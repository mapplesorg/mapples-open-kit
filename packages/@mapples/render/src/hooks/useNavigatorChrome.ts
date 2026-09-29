import { useContext } from 'react';

import NavigatorChromeContext, {
  NavigatorChrome,
} from '../context/NavigatorChromeContext';

/**
 * The navigator chrome a host provides, or `undefined` when the component is
 * not mounted as a navigator's chrome. The library's chrome elements use this
 * to tell the designer they are not attached yet instead of failing.
 */
export const useOptionalNavigatorChrome = (): NavigatorChrome | undefined =>
  useContext(NavigatorChromeContext);

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
