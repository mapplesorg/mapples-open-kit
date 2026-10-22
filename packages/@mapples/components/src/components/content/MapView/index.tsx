/**
 * MapView picks its platform file at bundle time: Metro resolves `./MapView`
 * to `MapView.native.tsx` (react-native-maps) on iOS/Android and to the
 * static `MapView.tsx` on web, so web bundles never import react-native-maps.
 * TypeScript resolves the plain `MapView.tsx`; both files share the props in
 * `types.ts`.
 */
export { default } from './MapView';
