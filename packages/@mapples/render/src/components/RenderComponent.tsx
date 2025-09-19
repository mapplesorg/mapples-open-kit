import { FC, memo } from 'react';

import { useDataProps } from '@mapples/state';
import { map } from 'lodash';

import { useRender } from '../hooks';
import { RenderComponentType } from '../types';

const RenderComponent: FC<RenderComponentType> = ({
  type,
  props,
  dataProps,
  children,
  childComponents,
}) => {
  const { components } = useRender();
  const propsWithData = useDataProps(dataProps);

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
    <Component {...props} {...propsWithData}>
      {map(children, renderChildren)}
    </Component>
  );
};

const RenderComponentMemorized = memo(RenderComponent);

export default RenderComponent;
