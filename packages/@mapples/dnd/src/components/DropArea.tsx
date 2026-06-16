import { FC, PropsWithChildren } from 'react';

import { DropContextProvider } from '../context';
import { DropAreaProps } from '../types';

/**
 * Component that creates a drop area context for its children.
 * This component establishes a parent-child relationship in the drop target hierarchy.
 *
 * @param props - The component props
 * @param props.children - The child elements that will be registered under this drop area's parent ID
 * @param props.forId - The ID of the parent drop target this area belongs to
 * @returns The rendered drop area with context
 * @public
 */
const DropArea: FC<PropsWithChildren<DropAreaProps>> = ({
  children,
  forId,
}) => {
  return (
    <DropContextProvider value={{ parent: forId }}>
      {children}
    </DropContextProvider>
  );
};

export default DropArea;
