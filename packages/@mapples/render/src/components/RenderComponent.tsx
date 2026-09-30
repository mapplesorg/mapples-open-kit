import { FC, memo } from 'react';

import { map } from 'lodash';

import { useRender } from '../hooks';
import useConditionalStyled from '../hooks/useConditionalStyled';
import { useElementBindings } from '../hooks/useElementBindings';
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
  const {
    hidden,
    dataProps: visibleDataProps,
    refProps: resolvedRefProps,
    actionHandlers: mappedActionProps,
  } = useElementBindings(dataProps, actionProps, refProps);
  const propsWithConditional = useConditionalStyled(props);

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
