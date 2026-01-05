import { useContext, useMemo } from 'react';

import { AnyObject } from '@mapples/render';
import { useDataState } from '@mapples/state';
import { keys, reduce } from 'lodash';

import RenderStateContext from '../context/RenderStateContext';

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
