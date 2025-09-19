import { useContext } from 'react';

import { DropContext } from '../context';

const useDropContext = () => {
  return useContext(DropContext);
};

export default useDropContext;
