import { useCallback } from 'react';

import { messageStatePath, MessageText } from '@mapples/types';

import useDataState from './useDataState';

/**
 * Reads translated messages outside an element binding — navigation titles
 * and tab / drawer labels. The returned function gives the text of a message
 * key in the active locale, its placeholders read as binding paths exactly
 * as a `t.*` binding reads them; `undefined` when the key does not resolve
 * (an unknown key, or no `LocaleProvider`), so the caller shows its literal.
 */
const useMessageText = (): MessageText => {
  const { getValue } = useDataState();
  return useCallback<MessageText>(
    (key) => {
      const text = getValue({ key: messageStatePath(key), active: true }, null);
      return typeof text === 'string' ? text : undefined;
    },
    [getValue],
  );
};

export default useMessageText;
