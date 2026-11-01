import { useContext, useMemo } from 'react';

import { useDataState } from '@mapples/state';

import RenderStateContext from '../context/RenderStateContext';
import { AnyObject } from '../types';
import { applyStateVariants } from '../utils/applyStateVariants';

/**
 * Hook that applies a node's state variants to its `styled` prop.
 *
 * A `styled` key can carry a condition suffix (`style::pressed`); the variant
 * applies over its base while the render state's condition of that name holds.
 * A slot with active variants becomes `[base, ...variants]`; every other slot
 * reaches the component exactly as written (see `applyStateVariants`).
 *
 * @param props - Component props that may contain a `styled` object with conditional styles
 * @returns Props with the active variants applied
 *
 * @example
 * ```tsx
 * const props = {
 *   styled: {
 *     style: { backgroundColor: '#fff' },
 *     'style::isActive': { backgroundColor: '#000' },
 *   }
 * };
 *
 * const processedProps = useConditionalStyled(props);
 * // isActive holds:  styled.style = [{ backgroundColor: '#fff' }, { backgroundColor: '#000' }]
 * // otherwise:       styled.style = { backgroundColor: '#fff' }
 * ```
 *
 * @internal
 */
const useConditionalStyled = (props: AnyObject) => {
  const { getConditionResult } = useDataState();
  const state = useContext(RenderStateContext);

  const propsWithConditional = useMemo(() => {
    const styled: AnyObject = props?.styled;

    if (!styled) return props;

    return {
      ...props,
      styled: applyStateVariants(styled, (name) => {
        const condition = state?.[name];
        return condition ? getConditionResult(condition.condition) : false;
      }),
    };
  }, [props, state, getConditionResult]);

  return propsWithConditional;
};

export default useConditionalStyled;
