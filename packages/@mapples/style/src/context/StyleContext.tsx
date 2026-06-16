import { createContext } from 'react';

import { StyleContextType } from '../types';
import { Styler } from '../utils';

/**
 * React context that holds the current style configuration (theme, typography, sizing, responsive).
 * Consumed via `useStyle` and the derived hooks (`useTheme`, `useTypography`, `useSizing`).
 */
const StyleContext = createContext<StyleContextType>(Styler.init());

/** Context provider for `StyleContext`. Used internally by `StyleProvider`. */
export const StyleContextProvider = StyleContext.Provider;

export default StyleContext;
