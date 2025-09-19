import { useContext } from 'react';

import { RenderContext } from '../context';

const useRender = () => {
  return useContext(RenderContext);
};

export default useRender;
