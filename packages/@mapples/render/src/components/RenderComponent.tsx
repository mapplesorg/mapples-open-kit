import { FC, memo, useMemo } from 'react';

import { useActionStore } from '@mapples/action';
import { isThis, parseThis } from '@mapples/inlang';
import { useDataProps, useDataState } from '@mapples/state';
import { isPlainObject, map, mapValues } from 'lodash';

import { useRender } from '../hooks';
import useConditionalStyled from '../hooks/useConditionalStyled';
import useRefProps from '../hooks/useRefProps';
import { RenderComponentType } from '../types';

/**
 * Default implementation of a renderable component.
 *
 * This component handles the rendering of individual components within the render tree.
 * It resolves the component type from registered components, applies data properties,
 * and recursively renders child components.
 *
 * The component is memoized for performance optimization to prevent unnecessary
 * re-renders when props haven't changed.
 *
 * @param props - The component definition
 * @param props.type - The component type name (must be registered in the render context)
 * @param props.props - Component props including optional `zIndex`
 * @param props.dataProps - Optional data property bindings
 * @param props.refProps - Optional map of ref property names to asset reference strings
 * @param props.children - Array of child component IDs
 * @param props.childComponents - Map of child components keyed by their IDs
 *
 * @returns The rendered component, or `null` if the component type is not registered
 *
 * @example
 * ```tsx
 * const componentDef = {
 *   id: 'button1',
 *   type: 'Button',
 *   props: { title: 'Click me', onPress: handlePress },
 *   dataProps: { title: { key: 'buttonText', active: true } },
 *   children: [],
 *   childComponents: {}
 * };
 *
 * <RenderComponent {...componentDef} />
 * ```
 */
const RenderComponent: FC<RenderComponentType> = ({
  type,
  props,
  dataProps,
  actionProps,
  children,
  refProps,
  childComponents,
}) => {
  const { components } = useRender();
  const propsWithData = useDataProps(dataProps);
  const resolvedRefProps = useRefProps(refProps);

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
  const propsWithConditional = useConditionalStyled(props);
  const { getValue } = useDataState();
  const actionStore = useActionStore();

  // Turn each `actionProps` entry into a handler that emits onto the action
  // store. `dataProp` resolves from state (or an event arg for `"this"`);
  // `staticData` is a literal payload merged in last so author-time config —
  // e.g. a navigation target — survives regardless of state.
  const mappedActionProps = useMemo(
    () =>
      mapValues(actionProps, (actionProp) => {
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

  const Component = components[type as keyof typeof components].Component;

  if (!Component || hidden) {
    return null;
  }

  const renderChildren = (child: string) => {
    const renderComponentProps = childComponents[child];
    return (
      <RenderComponentMemorized
        {...renderComponentProps}
        key={renderComponentProps.id}
      />
    );
  };

  return (
    <Component
      {...propsWithConditional}
      {...visibleDataProps}
      {...resolvedRefProps}
      {...mappedActionProps}
    >
      {map(children, renderChildren)}
    </Component>
  );
};

/**
 * Memoized version of RenderComponent for performance optimization.
 * Prevents unnecessary re-renders when component props haven't changed.
 */
const RenderComponentMemorized = memo(RenderComponent);

export default RenderComponent;
