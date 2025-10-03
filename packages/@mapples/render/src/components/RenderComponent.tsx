import { FC, memo } from 'react';

import { useDataProps } from '@mapples/state';
import { map } from 'lodash';

import { useRender } from '../hooks';
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
 * @param {RenderComponentType} props - The component definition
 * @param {string} props.type - The component type name (must be registered)
 * @param {AnyObject & { zIndex?: number }} props.props - Component props
 * @param {DataProps} [props.dataProps] - Optional data property bindings
 * @param {string[]} props.children - Array of child component IDs
 * @param {ChildComponents} props.childComponents - Map of child components
 *
 * @returns {JSX.Element | null} The rendered component or null if component type not found
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
 *
 * @throws {Error} If the component type is not registered in the render context
 */
const RenderComponent: FC<RenderComponentType> = ({
  type,
  props,
  dataProps,
  children,
  refProps,
  childComponents,
}) => {
  const { components } = useRender();
  const propsWithData = useDataProps(dataProps);
  const resolvedRefProps = useRefProps(refProps);

  const Component = components[type as keyof typeof components].Component;

  if (!Component) {
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
    <Component {...props} {...propsWithData} {...resolvedRefProps}>
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
