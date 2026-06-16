import { useCallback, useEffect, useState } from 'react';

import useForm from './useForm';

/**
 * Hook to manage form history for undo/redo functionality.
 * This hook provides methods to navigate through form history and check availability of undo/redo operations.
 *
 * @returns Object containing history navigation methods and state
 *
 * @example
 * ```tsx
 * const HistoryControls = () => {
 *   const { prev, next, canPrev, canNext } = useFormHistory();
 *
 *   return (
 *     <div>
 *       <button onClick={prev} disabled={!canPrev}>Undo</button>
 *       <button onClick={next} disabled={!canNext}>Redo</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @public
 */
const useFormHistory = () => {
  const { form } = useForm();
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
