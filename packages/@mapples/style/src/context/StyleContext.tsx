import { createContext } from 'react';

import { StyleContextType } from '../types';
import { Styler } from '../utils';

const StyleContext = createContext<StyleContextType>(Styler.init());

export const StyleContextProvider = StyleContext.Provider;

export default StyleContext;
