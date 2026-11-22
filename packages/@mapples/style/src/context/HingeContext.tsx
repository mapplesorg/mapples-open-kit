import { createContext } from 'react';

import { Hinge } from '../types';

/**
 * React context that holds the hinge of the device the app runs on, or `null`
 * when it has none. Consumed via `useHinge`.
 */
const HingeContext = createContext<Hinge | null>(null);

/**
 * Context provider for `HingeContext`. An app on a foldable feeds it the live
 * value from `expo-hinge`; a preview feeds it the previewed device's.
 *
 * @example
 * ```tsx
 * import { useHinge as useDeviceHinge } from 'expo-hinge';
 *
 * const App = () => (
 *   <HingeProvider value={useDeviceHinge()}>
 *     <Screens />
 *   </HingeProvider>
 * );
 * ```
 */
export const HingeProvider = HingeContext.Provider;

export default HingeContext;
