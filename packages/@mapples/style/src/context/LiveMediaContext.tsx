import { createContext } from 'react';

/**
 * Whether the elements below may open live device media (a camera
 * preview). `true` unless a `LiveMediaProvider` says otherwise: an app and a
 * running preview use the camera; a design surface shows a still stand-in.
 */
const LiveMediaContext = createContext(true);

export default LiveMediaContext;
