import { useContext } from 'react';

import FormContext from '../context';

const useFormContext = () => {
  return useContext(FormContext);
};

export default useFormContext;
