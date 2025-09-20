import { RenderProps } from '../types';

import RenderComponent from './RenderComponent';

/**
 * Main render component that renders a component tree from a root component definition.
 *
 * This is the primary entry point for the render system. It takes a root component
 * definition and renders it using either a custom render component or the default
 * RenderComponent implementation.
 *
 * @param {RenderProps} props - The render props
 * @param {RenderComponentType} props.root - The root component to render
 * @param {FC<RenderComponentType>} [props.CustomRenderComponent] - Optional custom render component
 *
 * @example
 * ```tsx
 * const rootComponent = {
 *   id: 'root',
 *   type: 'View',
 *   props: { style: { flex: 1 } },
 *   children: ['child1'],
 *   childComponents: {
 *     child1: {
 *       id: 'child1',
 *       type: 'Text',
 *       props: { children: 'Hello World' },
 *       children: [],
 *       childComponents: {}
 *     }
 *   }
 * };
 *
 * const App = () => (
 *   <RenderProvider components={registeredComponents}>
 *     <Render root={rootComponent} />
 *   </RenderProvider>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Using a custom render component
 * const CustomRenderer = (props) => <div className="custom">{props.children}</div>;
 *
 * <Render
 *   root={rootComponent}
 *   CustomRenderComponent={CustomRenderer}
 * />
 * ```
 */
const Render = ({ root, CustomRenderComponent }: RenderProps) => {
  return CustomRenderComponent ? (
    <CustomRenderComponent {...root} />
  ) : (
    <RenderComponent {...root} />
  );
};

export default Render;
