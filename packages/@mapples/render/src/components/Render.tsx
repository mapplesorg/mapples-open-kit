import { RenderProps } from '../types';

import RenderComponent from './RenderComponent';

const Render = ({ root, CustomRenderComponent }: RenderProps) => {
  return CustomRenderComponent ? (
    <CustomRenderComponent {...root} />
  ) : (
    <RenderComponent {...root} />
  );
};

export default Render;
