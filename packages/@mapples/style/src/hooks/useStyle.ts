import { useContext } from 'react';

import { StyleContext } from '../context';
import { StyleContextType } from '../types';

const useStyle = (customStyleConfig?: StyleContextType) => {
  const style = useContext(StyleContext);

  return customStyleConfig ? customStyleConfig : style;
};

export default useStyle;
