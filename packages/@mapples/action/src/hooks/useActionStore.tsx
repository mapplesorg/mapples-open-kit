import { useContext } from 'react';

import ActionContext from '../context';

const useActionStore = () => {
  const { actionStore } = useContext(ActionContext);

  return actionStore;
};

export default useActionStore;
