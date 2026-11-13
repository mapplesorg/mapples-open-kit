import { createContext, useContext } from 'react';

import { LocaleContextType } from './types';

/**
 * Context holding the active locale and the project's messages. Defaults to
 * `null` so a host that never mounts a `LocaleProvider` keeps today's
 * behavior — `t.*` and `locale.*` bindings fall through to their `altValue`.
 */
const LocaleContext = createContext<LocaleContextType | null>(null);

export const LocaleContextProvider = LocaleContext.Provider;

/** The locale runtime, or `null` when no provider is mounted. */
export const useLocaleState = (): LocaleContextType | null =>
  useContext(LocaleContext);

export default LocaleContext;
