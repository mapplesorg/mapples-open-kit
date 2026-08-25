import { RenderStateContextProvider } from '../context/RenderStateContext';
import { RenderProps } from '../types';

import RenderComponent from './RenderComponent';

/**
 * Main render component that renders a component tree from a root component definition.
 *
 * This is the primary entry point for the render system. It takes a root component
 * definition and renders it using either a custom render component or the default
 * RenderComponent implementation.
 *
 * @param props - The render props
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
const Render = ({ root, state, CustomRenderComponent }: RenderProps) => {
  // The state (named conditions) context wraps custom renderers too, so
  // conditional style variants evaluate regardless of the pipeline.
  return (
    <RenderStateContextProvider value={state}>
      {CustomRenderComponent ? (
        <CustomRenderComponent {...root} />
      ) : (
        <RenderComponent {...root} />
      )}
    </RenderStateContextProvider>
  );
};

export default Render;
