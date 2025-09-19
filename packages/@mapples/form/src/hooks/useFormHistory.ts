import { useCallback, useContext, useEffect, useState } from 'react';

import FormContext from '../context';

const useFormHistory = () => {
  const { form } = useContext(FormContext);
  const [state, setState] = useState({ canPrev: false, canNext: false });

  useEffect(() => {
    const unsubscribe = form?.subscribeOnChange(() => {
      setState({
        canPrev: form?.canPrev() || false,
        canNext: form?.canNext() || false,
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [form]);

  const prev = useCallback(() => {
    if (!form) return false;
    return form.prev();
  }, [form]);

  const next = useCallback(() => {
    if (!form) return false;
    return form.next();
  }, [form]);

  return {
    prev,
    next,
    canPrev: state.canPrev,
    canNext: state.canNext,
  };
};

export default useFormHistory;
