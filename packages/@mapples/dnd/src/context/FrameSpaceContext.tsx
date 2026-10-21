import {
  createContext,
  FC,
  PropsWithChildren,
  RefObject,
  useContext,
  useMemo,
  type ComponentRef,
} from 'react';

import { View } from 'react-native';

export interface FrameSpaceContextType {
  /** The frame key registered with the monitor via `registerFrame`. */
  frameKey: string;
  /**
   * The view all drop elements in this frame measure against
   * (`measureLayout(frameRoot)`), yielding scale-independent frame-local
   * layout rects.
   */
  frameRootRef: RefObject<ComponentRef<typeof View> | null>;
}

const FrameSpaceContext = createContext<FrameSpaceContextType | null>(null);

/** The frame coordinate space the current subtree belongs to, if any. */
export const useFrameSpace = () => useContext(FrameSpaceContext);

export interface FrameSpaceProps {
  frameKey: string;
  frameRootRef: RefObject<ComponentRef<typeof View> | null>;
}

/**
 * Declares a frame coordinate space for all `useDrop` registrations beneath
 * it: elements measure relative to `frameRootRef` and register under
 * `frameKey`, making their rects independent of viewport pan/zoom.
 */
export const FrameSpace: FC<PropsWithChildren<FrameSpaceProps>> = ({
  frameKey,
  frameRootRef,
  children,
}) => {
  const value = useMemo(
    () => ({ frameKey, frameRootRef }),
    [frameKey, frameRootRef],
  );

  return <FrameSpaceContext value={value}>{children}</FrameSpaceContext>;
};

export default FrameSpaceContext;
