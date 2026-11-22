import { useContext } from 'react';

import LiveMediaContext from '../context/LiveMediaContext';

/**
 * Whether live device media (the camera) may open where the caller renders:
 * `true` unless a `LiveMediaProvider` above turned it off.
 */
const useLiveMedia = (): boolean => useContext(LiveMediaContext);

export default useLiveMedia;
