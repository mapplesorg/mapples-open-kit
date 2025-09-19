import { useContext } from 'react';

import { DropContext } from '../context';

/**
 * Hook to access the drop context.
 * This hook provides access to the parent drop target ID for establishing hierarchy.
 * 
 * @returns The drop context with parent information
 * @public
 */
const useDropContext = () => {
  return useContext(DropContext);
};

export default useDropContext;
