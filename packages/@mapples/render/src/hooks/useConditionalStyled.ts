import { useContext, useMemo } from 'react';

import { AnyObject } from '@mapples/render';
import { useDataState } from '@mapples/state';
import { keys, reduce } from 'lodash';

import RenderStateContext from '../context/RenderStateContext';

/**
 * Hook that processes component props to apply conditional styling based on state conditions.
 *
 * This hook evaluates conditions defined in the `styled` prop and applies conditional styles
 * based on the current render state. Style keys can include condition suffixes (e.g., "backgroundColor::conditionName")
 * that are evaluated against the render state.
 *
 * @param props - Component props that may contain a `styled` object with conditional styles
 * @returns Props with processed conditional styles applied
 *
 * @example
 * ```tsx
 * const props = {
 *   styled: {
 *     backgroundColor: '#fff',
 *     'backgroundColor::isActive': '#000',
 *   }
 * };
 *
 * const processedProps = useConditionalStyled(props);
 * // If isActive condition is true, backgroundColor will be '#000', otherwise '#fff'
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

    const activeKeys = reduce(
      keys(styled),
      (acc, next) => {
        const [styleKey, styleCondition] = next.split('::');

        let conditionActive = false;

        const condition = state?.[styleCondition];
        if (condition) {
          conditionActive = getConditionResult(condition?.condition);
        }

        return {
          ...acc,
          [styleKey]: [styled[styleKey], conditionActive && styled[next]],
        };
      },
      {},
    );

    return {
      ...props,
      styled: activeKeys,
    };
  }, [props, state, getConditionResult]);

  return propsWithConditional;
};

export default useConditionalStyled;
