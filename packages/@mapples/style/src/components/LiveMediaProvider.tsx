import { FC, PropsWithChildren } from 'react';

import LiveMediaContext from '../context/LiveMediaContext';

/** Props for {@link LiveMediaProvider}. */
export interface LiveMediaProviderProps {
  /** Whether the elements inside may open the camera. */
  enabled: boolean;
}

/**
 * Turns live device media (the camera) on or off for everything inside.
 * Off, a camera element draws its still stand-in and asks for nothing.
 *
 * An app needs none: live media is on by default. A design surface wraps
 * its screens in `<LiveMediaProvider enabled={false}>`, so placing a camera
 * on a screen does not open the camera, and a running preview wraps itself
 * in `<LiveMediaProvider enabled>`.
 *
 * @example
 * ```tsx
 * <LiveMediaProvider enabled={false}>
 *   <Screen />
 * </LiveMediaProvider>
 * ```
 */
const LiveMediaProvider: FC<PropsWithChildren<LiveMediaProviderProps>> = ({
  enabled,
  children,
}) => (
  <LiveMediaContext.Provider value={enabled}>
    {children}
  </LiveMediaContext.Provider>
);

export default LiveMediaProvider;
