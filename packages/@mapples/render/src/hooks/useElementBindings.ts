import { useMemo } from 'react';

import { useActionStore } from '@mapples/action';
import { isThis, parseThis } from '@mapples/inlang';
import { useDataProps, useDataState } from '@mapples/state';
import { DataProps } from '@mapples/types';
import { isPlainObject, mapValues } from 'lodash';

import { ActionPropsMap, AnyObject, RefPropsMap } from '../types';

import useRefProps from './useRefProps';

/**
 * Turn each `actionProps` entry into a handler that emits onto the action
 * store. `dataProp` resolves from state (or an event arg for `"(this)"`);
 * `staticData` is a literal payload merged in last so author-time config —
 * e.g. a navigation target — survives regardless of state.
 */
export const useActionHandlers = (
  actionProps: ActionPropsMap | undefined,
): Record<string, (...originalEventData: unknown[]) => void> => {
  const { getValue } = useDataState();
  const actionStore = useActionStore();

  return useMemo(
    () =>
      mapValues(actionProps ?? {}, (actionProp) => {
        return (...originalEventData: unknown[]) => {
          const dataProp = actionProp?.dataProp || '';
          let resolved: unknown;
          if (isThis(dataProp)) {
            const [, indexStr] = parseThis(dataProp);
            const index = indexStr ? parseInt(indexStr) : 0;
            resolved = originalEventData[!isNaN(index) ? index : 0];
          } else if (dataProp) {
            resolved = getValue({ key: dataProp, active: true });
          }

          const data = actionProp?.staticData
            ? {
                ...(isPlainObject(resolved)
                  ? (resolved as Record<string, unknown>)
                  : {}),
                ...actionProp.staticData,
              }
            : resolved;

          actionStore.next({
            time: Date.now(),
            type: actionProp?.type,
            payload: { originalEventData, data },
          });
        };
      }),
    [actionProps, actionStore, getValue],
  );
};

/** What an element's bindings resolve to. */
export interface ElementBindings {
  /**
   * The reserved `_visible` binding resolved to a falsy value: the element
   * (and its subtree) does not render.
   */
  hidden: boolean;
  /** Resolved data props (without `_visible`), to spread over the element's own props. */
  dataProps: AnyObject;
  /** Resolved `ref(…)` asset props. */
  refProps: AnyObject;
  /** One emitting handler per authored action. */
  actionHandlers: Record<string, (...originalEventData: unknown[]) => void>;
}

/**
 * Resolve an element's Creator bindings — data bindings (`dataProps`, with
 * the reserved `_visible`), asset references (`refProps`) and actions
 * (`actionProps`) — against the surrounding state, render and action
 * contexts. The single implementation behind the canvas render pipeline
 * (`RenderComponent`) and the exported app's `MapplesElement`, so a binding
 * behaves the same on the canvas, in Play and in the built app.
 */
export const useElementBindings = (
  dataProps: DataProps | undefined,
  actionProps: ActionPropsMap | undefined,
  refProps: RefPropsMap | undefined,
): ElementBindings => {
  const propsWithData = useDataProps(dataProps);
  const resolvedRefProps = useRefProps(refProps);
  const actionHandlers = useActionHandlers(actionProps);

  // Reserved binding: `dataProps._visible` conditionally shows the element.
  // Only an ACTIVE binding participates (inactive/absent → always visible);
  // a resolved falsy value (incl. the string 'false') hides the subtree.
  const { _visible: visibleValue, ...visibleDataProps } = propsWithData as {
    _visible?: unknown;
  } & Record<string, unknown>;
  const hidden =
    '_visible' in propsWithData &&
    (visibleValue == null ||
      visibleValue === false ||
      visibleValue === 'false' ||
      visibleValue === 0 ||
      visibleValue === '');

  return {
    hidden,
    dataProps: visibleDataProps,
    refProps: resolvedRefProps,
    actionHandlers,
  };
};

export default useElementBindings;
